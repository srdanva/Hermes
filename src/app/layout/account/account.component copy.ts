import { CustomerService, SearchResponse } from './../../shared/customer.service';
import { EventService, MeetingEvent } from './../../shared/event.service';
import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
// import * as gsap.default from 'gsap.default';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as createjs from 'createjs-module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';
import { distinctUntilChanged, debounceTime, switchMap, mergeMap, tap, map } from 'rxjs/operators';
import { timezones } from '../../shared/timezone';
import * as gsap from 'gsap'

@Component({
  selector: 'app-account',
  templateUrl: './account-1.component.html',
  styleUrls: ['./account-1.component.scss']
})
export class AccountComponent implements OnInit {


  @ViewChild('progress')
  progress: ElementRef<any>;

  @ViewChild('hole_left') hole_left_UP;
  @ViewChild('hole_left_UP') hole_left;
  @ViewChild('hole_right_UP') hole_right_UP;
  @ViewChild('hole_right') hole_right;

  preload = new createjs.LoadQueue();
  timezones = timezones();

  isInMeetings = false;
  isInMyMeetings = false;
  isInCreateMeeting = false;
  isSuccessSendingInvitation = false;

  isInLeftVideoMode = false;
  isInRightVideoMode = false;

  meetings: MeetingEvent[] = [];
  groupMeetings: any;
  meetingForm: FormGroup;
  minDate = new Date();

  isFormalSelected = true;
  isCasualSelected = false;
  nameTitle = "Mr";

  searchCustomers: SearchResponse[] = [];

  /*mainvideo*/
  video: any;
  video2: any;
  src: any;
  src2: any;
  /*media*/
  mediaVideoleft: any;
  mediaVideoright: any;
  mediaVideoLeftSrc: any;
  mediaVideoRightSrc: any;

  /*help*/
  helpLeft: any;
  helpRight: any;
  helpLeftSrc: any;
  helpRightSrc: any;
  /*eMeetings */
  eMeetLeft: any;
  eMeetRight: any;
  eMeetLeftSrc: any;
  eMeetRightSrc: any;


  // hole_left_UP: any;
  // hole_left: any;
  // hole_right_UP: any;
  // hole_right: any;
  mediaCenter: any;
  media_modal: any;
  modalGlobal: any;
  modals: any;
  btns: any;
  btn_now: any;
  eMeetings: any;
  eMeetings_modal: any;
  help_text: any;
  helpModal: any;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private customerService: CustomerService
  ) {
    (<any>window).createjs = createjs;
    this.preload = new createjs.LoadQueue(false);
  }

  async ngOnInit() {
    gsap.default.registerPlugin(ScrollTrigger);
    this.preloadResouces();
    this.initDomNodes();
    this.initContent();
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      name: ['', [Validators.required]],
      date: [new Date(), [Validators.required]],
      time: ['', [Validators.required]],
      description: ['', Validators.required],
      timezone: ['', [Validators.required]]
    });
    this.renderer.listen('window', 'load', () => {
      gsap.default.set(this.hole_left_UP.nativeElement, {
        left: this.hole_left.nativeElement.getBoundingClientRect().left,
        top: this.hole_left.nativeElement.getBoundingClientRect().top
      });
      gsap.default.set(this.hole_right_UP.nativeElement, {
        x: this.hole_right.nativeElement.getBoundingClientRect().x + 22,
        y: this.hole_right.nativeElement.getBoundingClientRect().y + 22
      });
    });
    this.meetingForm.get('email').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap((value: string) => {
        return value ? this.customerService.searchByEmailOrFullname(value, 'email') : [];
      })
    ).subscribe(customers => this.searchCustomers = customers);
    this.meetingForm.get('name').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap((value: string) => {
        return value ? this.customerService.searchByEmailOrFullname(value, 'full_name') : [];
      })
    ).subscribe(customers => this.searchCustomers = customers);
    this.meetingForm.get('timezone').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map((value: string) => {
        this.timezones = this.timezones.filter(t => t.toLowerCase().includes(value.toLowerCase()));
      })
    ).subscribe(value => value);
  }

  get title() {
    return this.meetingForm.get('title');
  }

  get email() {
    return this.meetingForm.get('email');
  }

  get name() {
    return this.meetingForm.get('name');
  }

  get date() {
    return this.meetingForm.get('date');
  }

  get time() {
    return this.meetingForm.get('time');
  }

  get description() {
    return this.meetingForm.get('description');
  }

  get timezone() {
    return this.meetingForm.get('timezone');
  }

  selectFormerOrCasual(event: any) {
    if (event.target.value === 'casual') {
      this.isFormalSelected = false;
      this.isCasualSelected = true;
    } else {
      this.isFormalSelected = true;
      this.isCasualSelected = false;
    }
  }

  selectTitle(event: any) {
    this.nameTitle = event;
  }

  async createMeeting(dontsendEmail: boolean) {
    Object.values(this.meetingForm.controls).forEach(control => {
      control.markAsTouched();
    });
    const time: Date[] = this.meetingForm.get('time').value;
    if (!time || typeof time !== 'object' || time.length !== 2 || !time[0] || !time[1]) {
      this.meetingForm.get('time').setErrors({ 'missingTime': 'missing starting time or ending time' });
      return;
    }
    if (this.meetingForm.valid) {
      const startingTime: Date = time[0];
      const duration = (time[1].getTime() - time[0].getTime()) / 1000 / 60;
      const date = this.meetingForm.value.date.toISOString().slice(0, 10);
      const startingDateTime = new Date(date + ' ' + startingTime.toTimeString().split(' ')[0]).toUTCString();
      try {
        let name: string;
        if (this.isFormalSelected) {
          name = `${this.nameTitle} ${this.meetingForm.value.name}`
        } else {
          name = this.meetingForm.value.name;
        }
        const res = await this.eventService.createEvent({
          name: this.meetingForm.value.title,
          email: this.meetingForm.value.email,
          startedAt: `${startingDateTime} ${this.meetingForm.value.timezone}`,
          duration: duration,
          description: this.meetingForm.value.description,
          fullName: name,
          dontSendInvitation: dontsendEmail
        });
        if (res) {
          this.isInCreateMeeting = false;
          this.isInMyMeetings = false;
          this.meetingForm.reset();
          this.isSuccessSendingInvitation = true;
        }
      } catch (e) {
        this.meetingForm.get('email').setErrors({ 'wrongEmail': 'Please check if the customer email exists' });
      }
    }
  }

  logout() {
    this.authService.logout();
  }

  async switchMeetingState(state: string) {
    if (state === 'myMeetings') {
      this.meetings = await this.eventService.getEvents();
      this.sortMeetingsByDate();
      this.isInMyMeetings = true;
      this.isInCreateMeeting = false;
      this.isSuccessSendingInvitation = false;
    } else {
      this.isInMyMeetings = false;
      this.isInCreateMeeting = true;
      this.isSuccessSendingInvitation = false;
    }
  }

  sortMeetingsByDate() {
    const sortByDate = this.meetings.sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );
    const groups = sortByDate.reduce((groups, meeting) => {
      const date = meeting.startedAt.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meeting);
      return groups;
    }, {});

    // Edit: to add it in the array format instead
    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        meetings: groups[date]
      };
    });
    this.groupMeetings = groupArrays;
  }

  preloadResouces() {
    this.preload.loadFile('/assets/img/watch_fluid_1_dec.mp4');
    this.preload.loadFile('/assets/img/watch_water_4_dec.mp4');
    this.preload.loadFile('/assets/img/sand_5_dec.mp4');
    this.preload.loadFile('/assets/img/birds_2_dec.mp4');
    this.preload.loadFile('/assets/img/fluid_2_dec.mp4');
    this.preload.loadFile('/assets/img/watch_water_3_dec.mp4');
    this.preload.loadFile('/assets/img/sand_3_dec.mp4');
    this.preload.loadFile('/assets/img/clouds_4_dec.mp4');
    this.preload.on("progress", (event: any) => {
      let progress = Math.floor(event.progress * 100);
      this.progress.nativeElement.style.width = progress + "%";
      if (progress == 100) {
        gsap.default.to('.preloader_overlay img', { autoAlpha: 0, duration: 0.9 });
        gsap.default.to('.preloader_overlay', { background: '#000', autoAlpha: 0, duration: 1, delay: 1 });
      }
    });
  }

  initDomNodes() {
    this.video = document.querySelector(".video-background-left");
    this.video2 = document.querySelector(".video-background-right");
    this.src = this.video.currentSrc || this.video.src;
    this.src2 = this.video2.currentSrc || this.video2.src;
    this.mediaVideoleft = document.querySelector(".media-left");
    this.mediaVideoright = document.querySelector(".media-right");
    this.mediaVideoLeftSrc = this.mediaVideoleft.currentSrc || this.mediaVideoleft.src;
    this.mediaVideoRightSrc = this.mediaVideoright.currentSrc || this.mediaVideoright.src;
    this.helpLeft = document.querySelector(".help-left");
    this.helpRight = document.querySelector(".help-right");
    this.helpLeftSrc = this.helpLeft.currentSrc || this.helpLeft.src;
    this.helpRightSrc = this.helpRight.currentSrc || this.helpRight.src;
    this.eMeetLeft = document.querySelector(".eMeetings-left");
    this.eMeetRight = document.querySelector(".eMeetings-right");
    this.eMeetLeftSrc = this.eMeetLeft.currentSrc || this.eMeetLeft.src;
    this.eMeetRightSrc = this.eMeetRight.currentSrc || this.eMeetRight.src;
    this.mediaCenter = document.querySelector(".mediaCenter");
    this.media_modal = document.querySelector('.media_modal');
    this.modalGlobal = document.querySelector('.modalGlobal');
    this.modals = document.querySelectorAll('.modal');
    this.btns = document.querySelectorAll('.btn');
    this.eMeetings = document.querySelector(".eMeetings");
    this.eMeetings_modal = document.querySelector(".eMeetings_modal");
    this.help_text = document.querySelector(".help_text");
    this.helpModal = document.querySelector(".helpModal");
    this.modalGlobal = document.querySelector('.modalGlobal');
  }

  getLink(meetingUrl: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = meetingUrl;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  async sendAgain(meeting: MeetingEvent) {
    await this.eventService.sendAgain(meeting);
    
  }

  leftMouseEnter() {
    (<any>document.querySelector('.bg_left .hermes-container')).style.overflow = "visible";
    (<any>document.querySelector('.bg_left .hermes-scroll-fixed')).style.position = "relative";
    (<any>document.querySelector('.hermes-bg-img-left')).style.display = "none";
    (<any>document.querySelector('.video-container-left')).style.zIndex = "999";
    (<any>document.querySelector('.bg_left')).style.zIndex = "99";
  }

  leftMouseLeave() {
    (<any>document.querySelector('.bg_left .hermes-container')).style.overflow = "hidden";
    (<any>document.querySelector('.bg_left .hermes-scroll-fixed')).style.position = "fixed";
    (<any>document.querySelector('.hermes-bg-img-left')).style.display = "block";
    (<any>document.querySelector(' .video-container-left')).style.zIndex = "-1";
    (<any>document.querySelector('.bg_left')).style.zIndex = "-1";
  }


  rightMouseEnter() {
    (<any>document.querySelector('.bg_right .hermes-container')).style.overflow = "visible";
    (<any>document.querySelector('.bg_right .hermes-scroll-fixed')).style.position = "relative";
    (<any>document.querySelector('.hermes-bg-img-right')).style.display = "none";
    (<any>document.querySelector('.video-container-right')).style.zIndex = "999";
    (<any>document.querySelector('.bg_right')).style.zIndex = "99";
  }

  rightMouseLeave() {
    (<any>document.querySelector('.bg_right .hermes-container')).style.overflow = "hidden";
    (<any>document.querySelector('.bg_right .hermes-scroll-fixed')).style.position = "fixed";
    (<any>document.querySelector('.hermes-bg-img-right')).style.display = "block";
    (<any>document.querySelector('.video-container-right')).style.zIndex = "-1";
    (<any>document.querySelector('.bg_right')).style.zIndex = "-1";
  }
  initContent() {
    // this.hole_left_UP.addEventListener('mouseenter', () => {
    //   console.log(123);
    //   (<any>document.querySelector('.bg_left .hermes-container')).style.overflow = "visible";
    //   (<any>document.querySelector('.bg_left .hermes-scroll-fixed')).style.position = "relative";
    //   (<any>document.querySelector('.hermes-bg-img-left')).style.display = "none";
    //   (<any>document.querySelector('.video-container-left')).style.zIndex = "999";
    //   (<any>document.querySelector('.bg_left')).style.zIndex = "99";
    // });
    // this.hole_left_UP.addEventListener('mouseleave', () => {
    //   (<any>document.querySelector('.bg_left .hermes-container')).style.overflow = "hidden";
    //   (<any>document.querySelector('.bg_left .hermes-scroll-fixed')).style.position = "fixed";
    //   (<any>document.querySelector('.hermes-bg-img-left')).style.display = "block";
    //   (<any>document.querySelector(' .video-container-left')).style.zIndex = "-1";
    //   (<any>document.querySelector('.bg_left')).style.zIndex = "-1";
    // });

    // this.hole_right_UP.addEventListener('mouseenter', () => {
    //   (<any>document.querySelector('.bg_right .hermes-container')).style.overflow = "visible";
    //   (<any>document.querySelector('.bg_right .hermes-scroll-fixed')).style.position = "relative";
    //   (<any>document.querySelector('.hermes-bg-img-right')).style.display = "none";
    //   (<any>document.querySelector('.video-container-right')).style.zIndex = "999";
    //   (<any>document.querySelector('.bg_right')).style.zIndex = "99";
    // });
    // this.hole_right_UP.addEventListener('mouseleave', () => {
    //   (<any>document.querySelector('.bg_right .hermes-container')).style.overflow = "hidden";
    //   (<any>document.querySelector('.bg_right .hermes-scroll-fixed')).style.position = "fixed";
    //   (<any>document.querySelector('.hermes-bg-img-right')).style.display = "block";
    //   (<any>document.querySelector('.video-container-right')).style.zIndex = "-1";
    //   (<any>document.querySelector('.bg_right')).style.zIndex = "-1";
    // });

    // this.mediaCenter.addEventListener('click', () => {
    //   if (this.media_modal.classList.contains('hide')) {
    //     this.scrollVideo_left(this.src, this.video, false);
    //     this.scrollVideo_right(this.src2, this.video2, false);

    //     this.scrollVideo_left(this.mediaVideoLeftSrc, this.mediaVideoleft, true);
    //     this.scrollVideo_right(this.mediaVideoRightSrc, this.mediaVideoright, true);

    //     this.scrollVideo_left(this.eMeetLeftSrc, this.eMeetLeft, false);
    //     this.scrollVideo_right(this.eMeetRightSrc, this.eMeetRight, false);

    //     this.scrollVideo_left(this.helpLeftSrc, this.helpLeft, false);
    //     this.scrollVideo_right(this.helpRightSrc, this.helpRight, false);
    //     this.isInMeetings = false;
    //     this.isInMyMeetings = false;
    //     this.isInCreateMeeting = false;
    //     this.isSuccessSendingInvitation = false;
    //     this.media_modal.classList.remove('hide');
    //     this.eMeetings_modal.classList.add('hide');
    //     this.helpModal.classList.add('hide');
    //     this.media_modal.classList.add('show');
    //     gsap.default.fromTo('.modalGlobal',
    //       { autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
    //       { autoAlpha: 1, scale: 1, duration: 0.5, yPercent: -50, xPercent: -50 });
    //     gsap.default.set('.modalGlobal', { width: '88%', height: '70%', top: '55%', left: '48%' });
    //     gsap.default.set(['.media-left', '.media-right'], { display: 'block' });
    //     gsap.default.set(['.video-background-left', '.video-background-right'], { display: 'none' });
    //     gsap.default.set('.hermes-bg-img-left', { background: 'url(/assets/img/watch_fluid_1_bg.jpg)' });
    //     gsap.default.set('.hermes-bg-img-right', { background: 'url(/assets/img/fluid_2_bg.jpg)' });
    //     gsap.default.set('.media_modal', { display: "flex", flexDirection: "column" });
    //     gsap.default.to(".mediaCenter", { fontSize: '1.5em', color: '#fff', duration: 0.5 });
    //     /*hole*/
    //     // gsap.default.default.to('.hole_left', {
    //     //   top: '65%', left: '5%', duration: 0.5, onComplete: () => {
    //     //     gsap.default.default.set('.hole_left_UP', { top: this.hole_left.getBoundingClientRect().top, left: this.hole_left.getBoundingClientRect().left });
    //     //   }
    //     // });
    //     // gsap.default.default.to('.hole_right', {
    //     //   top: '45%', right: '3%', duration: 0.5, onComplete: () => {
    //     //     gsap.default.default.set('.hole_right_UP', { top: this.hole_right.getBoundingClientRect().top + 22, left: this.hole_right.getBoundingClientRect().left + 22 });
    //     //   }
    //     // });
    //     /********/
    //     gsap.default.set('.helpModal', { display: "none" });
    //     gsap.default.set('.eMeetings_modal', { display: "none" });
    //     gsap.default.to(".help_text", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });
    //     gsap.default.to(".mediaCenter", { fontSize: '1.3em', color: '#00d2ff', duration: 0.5 });
    //     gsap.default.to(".eMeetings", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });
    //   }
    // });
    this.eMeetings.addEventListener('click', () => {
      if (this.eMeetings_modal.classList.contains('hide')) {
        this.scrollVideo_left(this.src, this.video, false);
        this.scrollVideo_right(this.src2, this.video2, false);
        this.scrollVideo_left(this.mediaVideoLeftSrc, this.mediaVideoleft, false);
        this.scrollVideo_right(this.mediaVideoRightSrc, this.mediaVideoright, false);
        this.scrollVideo_left(this.eMeetLeftSrc, this.eMeetLeft, true);
        this.scrollVideo_right(this.eMeetRightSrc, this.eMeetRight, true);
        this.scrollVideo_left(this.helpLeftSrc, this.helpLeft, false);
        this.scrollVideo_right(this.helpRightSrc, this.helpRight, false);
        this.isInMeetings = true;
        this.isInCreateMeeting = false;
        this.isInMyMeetings = false;
        this.isSuccessSendingInvitation = false;
        this.eMeetings_modal.classList.remove('hide');
        this.helpModal.classList.add('hide');
        this.media_modal.classList.add('hide');
        this.eMeetings_modal.classList.add('show');
        gsap.default.fromTo('.modalGlobal',
          { autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
          { autoAlpha: 1, scale: 1, duration: 0.5, yPercent: -50, xPercent: -50 });
        gsap.default.set('.modalGlobal', { width: '70%', height: '70%', top: '60%', left: '50%' });
        gsap.default.set(['.eMeetings-left', '.eMeetings-right'], { display: 'block' });
        gsap.default.set(['.video-background-left', '.video-background-right'], { display: 'none' });
        gsap.default.set('.hermes-bg-img-left', { background: 'url(/assets/img/watch_water_4_bg.jpg)' });
        gsap.default.set('.hermes-bg-img-right', { background: 'url(/assets/img/watch_water_3_bg.jpg)' });
        gsap.default.set('.eMeetings_modal', { display: "flex", flexDirection: "column" });

        gsap.default.set('.helpModal', { display: "none" });
        gsap.default.set('.media_modal', { display: "none" });
        gsap.default.to(".help_text", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });
        gsap.default.to(".mediaCenter", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });
        gsap.default.to(".eMeetings", { fontSize: '1.3em', color: '#fff', duration: 0.5 });
        /*hole*/
        // gsap.default.default.to('.hole_left', {
        //   top: '65%', left: '6%', duration: 0.5, onComplete: () => {
        //     gsap.default.default.set('.hole_left_UP', { top: this.hole_left.getBoundingClientRect().top, left: this.hole_left.getBoundingClientRect().left });
        //   }
        // });
        // gsap.default.default.to('.hole_right', {
        //   top: '55%', right: '8%', duration: 0.5, onComplete: () => {
        //     gsap.default.default.set('.hole_right_UP', { top: this.hole_right.getBoundingClientRect().top + 22, left: this.hole_right.getBoundingClientRect().left + 22 });
        //   }
        // });
      }
    });
    // this.help_text.addEventListener('click', () => {
    //   if (this.helpModal.classList.contains('hide')) {
    //     this.scrollVideo_left(this.src, this.video, false);
    //     this.scrollVideo_right(this.src2, this.video2, false);
    //     this.scrollVideo_left(this.mediaVideoLeftSrc, this.mediaVideoleft, false);
    //     this.scrollVideo_right(this.mediaVideoRightSrc, this.mediaVideoright, false);
    //     this.scrollVideo_left(this.eMeetLeftSrc, this.eMeetLeft, false);
    //     this.scrollVideo_right(this.eMeetRightSrc, this.eMeetRight, false);
    //     this.scrollVideo_left(this.helpLeftSrc, this.helpLeft, true);
    //     this.scrollVideo_right(this.helpRightSrc, this.helpRight, true);
    //     this.isInMeetings = false;
    //     this.isInMyMeetings = false;
    //     this.isInCreateMeeting = false;
    //     this.isSuccessSendingInvitation = false;
    //     this.helpModal.classList.remove('hide');
    //     this.eMeetings_modal.classList.add('hide');
    //     this.media_modal.classList.add('hide');
    //     this.helpModal.classList.add('show');
    //     gsap.default.fromTo('.modalGlobal',
    //       { autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
    //       { autoAlpha: 1, scale: 1, duration: 0.5, yPercent: -50, xPercent: -50 });
    //     gsap.default.set('.modalGlobal', { width: '40%', height: '40%', top: '60%', left: '30%' });
    //     gsap.default.set(['.help-left', '.help-right'], { display: 'block' });
    //     gsap.default.set(['.video-background-left', '.video-background-right'], { display: 'none' });
    //     gsap.default.set('.hermes-bg-img-left', { background: 'url(/assets/img/sand_5_bg.jpg)' });
    //     gsap.default.set('.hermes-bg-img-right', { background: 'url(/assets/img/sand_3_bg.jpg)' });
    //     gsap.default.set('.helpModal', { display: "flex", flexDirection: "column" });
    //     gsap.default.set('.media_modal', { display: "none" });
    //     gsap.default.set('.eMeetings_modal', { display: "none" });
    //     gsap.default.to(".eMeetings", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });
    //     gsap.default.to(".mediaCenter", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });
    //     /*hole*/
    //     // gsap.default.default.to('.hole_left', {
    //     //   top: '43%', left: '7%', duration: 0.5, onComplete: () => {
    //     //     gsap.default.default.set('.hole_left_UP', { top: this.hole_left.getBoundingClientRect().top, left: this.hole_left.getBoundingClientRect().left });
    //     //   }
    //     // });
    //     // gsap.default.default.to('.hole_right', {
    //     //   top: '20%', right: '17%', duration: 0.5, onComplete: () => {
    //     //     gsap.default.default.set('.hole_right_UP', { top: this.hole_right.getBoundingClientRect().top + 22, left: this.hole_right.getBoundingClientRect().left + 22 });
    //     //   }
    //     // });
    //     gsap.default.to(".help_text", { color: '#fff', duration: 0.5 });
    //   }
    // });


    // window.addEventListener('click', e => {
    //   e.preventDefault();
    //   let target = e.target;
    //   let its_modal = target === this.modalGlobal || this.modalGlobal.contains(target) || target === this.btn_now;
    //   if (!its_modal) {
    //     gsap.default.default.set('.hermes-bg-img-left',
    //       {
    //         backgroundImage: 'url(/assets/img/birds_2.jpg) ',
    //         backgroundSize: "cover",
    //         backgroundPosition: "center",
    //         backgroundRepeat: "no-repeat",
    //         zIndex: 2
    //       });
    //     gsap.default.default.set('.hermes-bg-img-right',
    //       {
    //         backgroundImage: 'url(/assets/img/clouds_4.jpg) ',
    //         backgroundSize: "cover",
    //         backgroundPosition: "center",
    //         backgroundRepeat: "no-repeat",
    //         zIndex: 2
    //       });
    //     gsap.default.default.set(['.video-container-left', '.video-container-right'],
    //       {
    //         zIndex: -1
    //       });

    //     gsap.default.default.set(['.help-left', '.help-right'], { display: 'none' });
    //     gsap.default.default.set('.video-background-left', { display: 'block' });
    //     gsap.default.default.set('.video-background-right', { display: 'block' });
    //     gsap.default.default.to('.hole_left', {
    //       top: '50vh', left: '7%', duration: 0.5, onComplete: () => {
    //         gsap.default.default.set('.hole_left_UP', { top: this.hole_left.getBoundingClientRect().top, left: this.hole_left.getBoundingClientRect().left });
    //       }
    //     });
    //     gsap.default.default.to('.hole_right', {
    //       top: '70vh', right: '10%', duration: 0.5, onComplete: () => {
    //         gsap.default.default.set('.hole_right_UP', { top: this.hole_right.getBoundingClientRect().top + 22, left: this.hole_right.getBoundingClientRect().left + 22 });
    //       }
    //     });
    //     gsap.default.default.to('.modalGlobal', {
    //       scale: 0,
    //       width: '0%',
    //       height: '0%',
    //       top: '50%',
    //       left: '50%',
    //       yPercent: -50,
    //       xPercent: -50,
    //       duration: 0.3
    //     });
    //     gsap.default.default.set('.helpModal', { display: "none" });
    //     gsap.default.default.set('.media_modal', { display: "none" });
    //     gsap.default.default.set('.eMeetings_modal', { display: "none" });
    //     gsap.default.default.to(".help_text", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });
    //     gsap.default.default.to(".eMeetings", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });
    //     gsap.default.default.to(".mediaCenter", { fontSize: '1em', color: '#00d2ff', duration: 0.5 });

    //     this.scrollVideo_left(this.src, this.video, true);
    //     this.scrollVideo_right(this.src2, this.video2, true);

    //     this.scrollVideo_left(this.mediaVideoLeftSrc, this.mediaVideoleft, false);
    //     this.scrollVideo_right(this.mediaVideoRightSrc, this.mediaVideoright, false);

    //     this.scrollVideo_left(this.eMeetLeftSrc, this.eMeetLeft, false);
    //     this.scrollVideo_right(this.eMeetRightSrc, this.eMeetRight, false);

    //     this.scrollVideo_left(this.helpLeftSrc, this.helpLeft, false);
    //     this.scrollVideo_right(this.helpRightSrc, this.helpRight, false);
    //     this.modals.forEach(modal => {
    //       if (modal.classList.contains("show")) {
    //         modal.classList.remove("show");
    //         modal.classList.add("hide");
    //       }
    //     });
    //   }
    // });

    this.btns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.btn_now = btn;
      })
    });

  }


  once(el, event, fn, opts?) {
    let onceFn = function (e) {
      el.removeEventListener(event, onceFn);
      fn.apply(this, arguments);
    };
    el.addEventListener(event, onceFn, opts);
    return onceFn;
  }

  scrollVideo_left(src, video, status) {

    this.once(document.documentElement, "touchstart", function (e) {
      video.play();
      video.pause();
    });

    let tl = gsap.default.timeline({
      defaults: { duration: 1 },
      scrollTrigger: {
        trigger: ".bg_left .hermes-scroll-abf",
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });

    this.once(video, "loadedmetadata", () => {
      tl.fromTo(video, { currentTime: 0 }, { currentTime: video.duration || 1 });
    });

    // setTimeout(function () {
    //   if (window["fetch"]) {
    //     const that = this;
    //     fetch(src)
    //       .then((response) => response.blob())
    //       .then((response) => {
    //         let blobURL = URL.createObjectURL(response);
    //         let t = video.currentTime;
    //         that.once(document.documentElement, "touchstart", function (e) {
    //           video.play();
    //           video.pause();
    //         });
    //         if (status) {
    //           video.setAttribute("src", blobURL);
    //           video.currentTime = t + 0.01;
    //         } else {
    //           URL.revokeObjectURL(src);
    //           video.setAttribute("src", blobURL);
    //         }

    //       });
    //   }
    // }, 400);
  } /* end scrollVideo_left*/

  scrollVideo_right(src2, video2, status) {
    this.once(document.documentElement, "touchstart", function (e) {
      video2.play();
      video2.pause();
    });

    let tl2 = gsap.default.timeline({
      defaults: { duration: 1 },
      scrollTrigger: {
        trigger: ".bg_right .hermes-scroll-abf",
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
    this.once(video2, "loadedmetadata", () => {
      tl2.fromTo(video2, { currentTime: 0 }, { currentTime: video2.duration || 1 });
    });
    const that = this;
    // setTimeout(function () {
    //   if (window["fetch"]) {
    //     fetch(src2)
    //       .then((response) => response.blob())
    //       .then((response) => {
    //         let blobURL = URL.createObjectURL(response);
    //         let t = video2.currentTime;
    //         that.once(document.documentElement, "touchstart", function (e) {
    //           video2.play();
    //           video2.pause();
    //         });
    //         if (status) {
    //           video2.setAttribute("src", blobURL);
    //           video2.currentTime = t + 0.01;
    //         } else {
    //           URL.revokeObjectURL(src2);
    //           video2.setAttribute("src", blobURL);
    //         }
    //       });
    //   }
    // }, 400);
  }

}
