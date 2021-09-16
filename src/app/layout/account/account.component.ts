import { ResponsiveService } from './../../shared/responsive.service';
import { CustomerService, SearchResponse } from './../../shared/customer.service';
import { EventService, MeetingEvent } from './../../shared/event.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import * as gsap.default from 'gsap.default';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as createjs from 'createjs-module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';
import { distinctUntilChanged, debounceTime, mergeMap, map, filter } from 'rxjs/operators';
import { timezones } from '../../shared/timezone';
import * as gsap from 'gsap'
import { DatePipe } from '@angular/common';
import { NotifierService } from "angular-notifier";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductCate, ProductCateService } from '../../shared/product-cate.service';
import { Product, ProductService } from '../../shared/product.service';
import { MediaService } from '../../shared/media.service';
import { getPdfIndex } from '../../shared/get-index.util';

@Component({
  selector: 'app-account',
  templateUrl: './account-1.component.html',
  styleUrls: ['./account-1.component.scss']
})
export class AccountComponent implements OnInit {

  @ViewChild('progress')
  progress: ElementRef<any>;

  preload = new createjs.LoadQueue();
  timezones = timezones();

  isInMeetings = false;
  isInMyMeetings = false;
  isInCreateMeeting = false;
  isSuccessSendingInvitation = false;
  isViewMeeting = false;
  isViewSupport = false;

  isInMediaCenter = false;
  mediaCenterState: number;
  indexPicSrc: any;
  indexDescription: string;
  isIndex = true;

  isInLeftVideoMode = false;
  isInRightVideoMode = false;

  productCates: ProductCate[];
  products: Product[];
  selectedProductCate: ProductCate;

  showPressReleases = false;
  pressSelection: string;
  pdfPreview = false;
  picturersSelection: string;
  pdfPreviewImage: any;

  showPicturers = false;
  selectedPicturer: string;
  movieSelection: string;
  picturer = [];

  showMovies = false;
  movies = [];
  videoPreview = false;
  selectedVideo: any;
  selectedVideoName: string;

  meetings: MeetingEvent[] = [];
  eMeetings: MeetingEvent[] = [];
  groupMeetings: any;
  meetingForm: FormGroup;
  supportForm: FormGroup;
  minDate = new Date();
  dateRange = [this.minDate]
  meetingType: 'e-meeting' | 'one-to-one';
  selectedMeeting: MeetingEvent;
  isFormalSelected = true;
  isCasualSelected = false;
  nameTitle = "Mr";
  selectedLanguage = 'EN';
  selectedGender = 'man';
  isMobile: boolean;
  dontSend: boolean;
  loading: boolean;
  pdfIndex = getPdfIndex();

  searchCustomers: SearchResponse[] = [];

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private responsiveService: ResponsiveService,
    private notifier: NotifierService,
    private element: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private productCateService: ProductCateService,
    private mediaService: MediaService
  ) {
    (<any>window).createjs = createjs;
    this.preload = new createjs.LoadQueue(false);
  }

  async ngOnInit() {
    this.productCates = await this.productCateService.getAllProductCates();
    this.products = await this.productService.getAllProducts();
    this.route.queryParams
      .subscribe(params => {
        if (params.event) {
          this.findMeeting(params.event);
        } else if (params.shared) {
          try {
            const data = JSON.parse(atob(params.shared));
            //this.startMeeting(data.slug, { displayName: data.fullName, email: data.email });
          } catch (e) {
            this.router.navigate(['']);
          }
        }
      });

    gsap.default.registerPlugin(ScrollTrigger);
    this.preloadResouces();
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      fullName: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      date: [new Date(), [Validators.required]],
      time: ['', Validators.required],
      description: [''],
      timezone: ['', [Validators.required]],
      language: ['', [Validators.required]]
    });
    this.supportForm = this.fb.group({
      supportSenderEmail: [this.authService.getEmail() || '', [Validators.email, Validators.required]],
      supportSenderMessage: ['', Validators.required],
    });
    this.loading = false;
    this.meetingForm.get('email').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap((value: string) => {
        return value ? this.customerService.searchByEmailOrFullname(value, 'email') : [];
      })
    ).subscribe(customers => this.searchCustomers = customers);
    this.meetingForm.get('fullName').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      mergeMap((value: string) => {
        return value ? this.customerService.searchByEmailOrFullname(value, 'full_name') : [];
      })
    ).subscribe(customers => this.searchCustomers = customers);
    this.meetingForm.get('timezone').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(value => value),
      map((value: string) => {
        if (value) {
          this.timezones = this.timezones.filter(t => t.toLowerCase().includes(value.toLowerCase()));
        } else {
          this.timezones = timezones();
        }
      })
    ).subscribe(value => value);
    this.isMobile = this.responsiveService.getInitMobileStatus();
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  }

  resetTimezones() {
    this.timezones = timezones();
  }

  resetForm() {
    this.meetingForm.reset();
    this.selectedMeeting = null;
    this.eMeetings = [];
    this.meetingType = null;
    this.searchCustomers = [];
    this.selectedLanguage = 'EN';
    this.loading = false;
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

  get fullName() {
    return this.meetingForm.get('fullName');
  }

  get date() {
    return this.meetingForm.get('date');
  }

  get time() {
    return this.meetingForm.get('time');
  }

  get timezone() {
    return this.meetingForm.get('timezone');
  }

  get language() {
    return this.meetingForm.get('language');
  }

  get gender() {
    return this.meetingForm.get('gender');
  }

  get supportSenderEmail() {
    return this.supportForm.get('supportSenderEmail');
  }

  get supportSenderMessage() {
    return this.supportForm.get('supportSenderMessage');
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
    this.nameTitle = event.target.value;
  }

  selectLanguage(event: any) {
    this.selectedLanguage = event.target.value;
  }

  async selectMeetingType(event: any) {
    this.meetingForm.patchValue({
      name: '',
      email: '',
      fullName: '',
      date: new Date(),
      timezone: '',
      language: '',
      gender: 'man',
    });
    if (event.target.value === 'one-to-one') {
      this.selectedMeeting = null;
      this.eMeetings = [];
      this.meetingType = 'one-to-one';
    } else if (event.target.value === 'e-meeting') {
      try {
        this.eMeetings = await this.eventService.getEvents(event.target.value);
      } catch (e) {
        if (e.error.message === 'Expired JWT Token') {
          this.logout();
        }
      }
      this.meetingType = 'e-meeting';
    }
  }

  selectEMeeting(meetingName: string) {
    this.selectedMeeting = this.eMeetings.find(m => m.name === meetingName);
    this.meetingForm.patchValue({
      title: 'e-meeting',
      name: this.selectedMeeting.name,
      timezone: this.selectedMeeting.timeZone,
      language: this.selectedMeeting.language
    });
  }

  getPressDate() {
    return this.selectedMeeting.startedAt.split('T')[0];
  }

  getPressTime() {
    const startTime = this.selectedMeeting.startedAt.split('+')[0];
    const endTime = new Date(new Date(startTime).getTime() + this.selectedMeeting.duration * 60 * 1000);
    const datePipe = new DatePipe('en');

    return datePipe.transform(startTime, 'HH:mm:ss', this.selectedMeeting.timeZone)
      + ' ~ ' + datePipe.transform(endTime, 'HH:mm:ss', this.selectedMeeting.timeZone);
  }

  async createMeeting(dontsendEmail: boolean) {
    if (this.loading) {
      return;
    }
    Object.values(this.meetingForm.controls).forEach(control => {
      control.markAsTouched();
    });
    if (this.meetingType === 'one-to-one') {
      const time: Date[] = this.meetingForm.get('time').value;
      if (!time || typeof time !== 'object' || time.length !== 2 || !time[0] || !time[1]) {
        this.meetingForm.get('time').setErrors({ 'missingTime': 'missing starting time or ending time' });
        return;
      }
      this.meetingForm.patchValue({
        name: this.meetingForm.value.language === 'EN' ? 'Hermès - your personal rendez-vous' : 'Hermès - Votre rendez-vous personnel'
      });
      if (this.meetingForm.valid) {
        const date = this.meetingForm.get('date').value;
        const startingTime: Date = time[0];
        const duration = Math.floor((time[1].getTime() - time[0].getTime()) / 1000 / 60);

        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        const mouth = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        const hours = startingTime.getHours() < 10 ? '0' + startingTime.getHours() : startingTime.getHours();
        const minutes = startingTime.getMinutes() < 10 ? '0' + startingTime.getMinutes() : startingTime.getMinutes();
        const startingDateTime = `${date.getFullYear()}-${mouth}-${day} ${hours}:${minutes}:00`;

        try {
          let name: string;
          if (this.isFormalSelected) {
            name = `${this.nameTitle} ${this.meetingForm.value.fullName}`
          } else {
            name = this.meetingForm.value.fullName;
          }

          this.loading = true;
          const res = await this.eventService.createEvent({
            name: this.meetingForm.value.name,
            email: this.meetingForm.value.email,
            startedAt: `${startingDateTime} ${this.meetingForm.value.timezone}`,
            duration: duration,
            fullName: name,
            gender: this.meetingForm.value.gender,
            dontSendInvitation: dontsendEmail,
            language: this.meetingForm.value.language,
            description: this.meetingForm.value.description
          });
          if (res) {
            this.dontSend = dontsendEmail;
            this.isInCreateMeeting = false;
            this.isInMyMeetings = false;
            this.resetForm();
            this.isSuccessSendingInvitation = true;
          }
        } catch (e) {
          this.loading = false;
          if (e.error.message === 'Expired JWT Token') {
            this.logout();
          }
          console.error(e);
          this.notifier.notify('error', 'Sorry, an error occurred, please try again.');
        }
      }
    } else if (this.meetingType === 'e-meeting') {
      try {
        if (this.meetingForm.get('email').value && this.meetingForm.get('fullName').value) {
          let fullName: string;
          if (this.isFormalSelected) {
            fullName = `${this.nameTitle} ${this.meetingForm.value.fullName}`
          } else {
            fullName = this.meetingForm.value.fullName;
          }

          this.loading = true;
          await this.eventService.createPressConferenceEvent(this.selectedMeeting.id, {
            email: this.meetingForm.get('email').value,
            fullName: fullName,
            gender: this.meetingForm.value.gender,
            language: this.meetingForm.value.language,
            dontSendInvitation: dontsendEmail,
          });

          this.isInCreateMeeting = false;
          this.isInMyMeetings = false;
          this.resetForm();
          this.dontSend = dontsendEmail;
          this.isSuccessSendingInvitation = true;
        }
      } catch (e) {
        this.loading = false;
        if (e.error.message === 'Expired JWT Token') {
          this.logout();
        }
        this.meetingForm.get('email').setErrors({ 'wrongEmail': e.error.detail || e.error.message });
      }
    }
  }

  async sendSupportMessage() {
    if (this.loading) {
      return;
    }

    Object.values(this.supportForm.controls).forEach(control => {
      control.markAsTouched();
    });

    if (this.supportForm.valid) {
      this.loading = true;
      await this.customerService.sendSupportMessage(
        this.supportForm.value.supportSenderEmail,
        this.supportForm.value.supportSenderMessage
      );

      this.isSuccessSendingInvitation = true;
      this.supportForm.reset();
      this.loading = false;
    }
  }

  logout() {
    this.authService.logout();
  }

  getCustomerName(meeting: MeetingEvent) {
    if (!!meeting.fullName) {
      return meeting.fullName;
    }

    if (meeting.participant) {
      if (meeting.participant.gender === 'm') {
        return `Mr. ${meeting.participant.fullName}`;
      } else if (meeting.participant.gender === 'f') {
        return `Mrs. ${meeting.participant.fullName}`;
      } else {
        return meeting.participant ? meeting.participant.fullName : 'Guest unknown';
      }
    } else {
      return meeting.participant ? meeting.participant.fullName : 'Guest unknown';
    }
  }

  loadMedia(media: Blob, isIndex?: boolean) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend = () => {
        if (isIndex) {
          this.indexPicSrc = reader.result;
        }
        return resolve(reader.result)
      };  
      if (media) {
        reader.readAsDataURL(media);
      }
    })
  }

  async switchMediaCenterState(event: Event, productCate: ProductCate) {
    if (event) {
      event.stopPropagation();
    }
    if (productCate) {
      const media = await this.mediaService.getMedia(productCate.image.src).toPromise();
      await this.loadMedia(media, true);
      this.selectedProductCate = productCate;
      this.indexDescription = productCate.description;
      this.mediaCenterState = productCate.id;
      this.resetMediaCenter();
    }
  }

  resetMediaCenter() {
    this.isIndex = true;
    this.pdfPreview = false;
    this.videoPreview = false;
    this.selectedPicturer = null;
    this.picturersSelection = null;
    this.showPicturers = false;
    this.movieSelection = null;
    this.showMovies = false;
    this.showPressReleases = false;
    this.pressSelection = null;
    this.pdfPreviewImage = null;
    this.selectedVideo = null;
  }

  clickMediaCenter() {
    this.isIndex = true;
    this.isInMeetings = false;
    this.isInMediaCenter = true;
    this.isInCreateMeeting = false;
    this.isInMyMeetings = false;
    this.isViewMeeting = false;
    this.isViewSupport = false;
    this.isSuccessSendingInvitation = false;
  }

  clickPressReleases(event: Event) {
    event.stopPropagation();
    this.isIndex = false;
    this.showPressReleases = !this.showPressReleases;
    this.showPicturers = false;
    this.picturersSelection = null;
    this.showMovies = false;
    this.movieSelection = null;
  }

  clickPicturers(event: Event) {
    event.stopPropagation();
    this.isIndex = false;
    this.showPicturers = !this.showPicturers;
    this.showPressReleases = false;
    this.pressSelection = null;
    this.showMovies = false;
    this.movieSelection = null;
  }

  clickMovies(event: Event) {
    event.stopPropagation();
    this.showMovies = !this.showMovies;
    this.isIndex = false;
    this.showPressReleases = false;
    this.showPicturers = false;
    this.pressSelection = null;
    this.picturersSelection = null;
    this.getMoviePictures();
  }

  async downloadMovie(event: Event, movie?: any) {
    event.stopPropagation();
    let link = document.createElement("a");
    if (movie) {
      const video = movie.video;
      const videoSource = await this.mediaService.getMedia(video.src).toPromise();
      movie = await this.loadMedia(videoSource);
      link.download = video.name;
    } else {
      movie = this.selectedVideo;
      link.download = this.selectedVideoName;
    }
    link.href = movie;
    link.click();
  }

  async getMoviePictures() {
    const medias = [];
    let productId = Number(this.mediaCenterState);
    if (productId === 4) {
      productId = 5;
    }
    const product = await this.productService.getProduct(productId);
    const videos = product.videos;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const videoImageSrc = video.image;
      const image = await this.mediaService.getMedia(videoImageSrc.src).toPromise();
      const media = await this.loadMedia(image);
      medias.push({
        video,
        image: media
      });
    }
    this.movies = medias;
  }

  async showVideoPreview(event: Event, video: any) {
    event.stopPropagation();
    video = video.video;
    this.selectedVideoName = video.name;
    const videoSource = await this.mediaService.getMedia(video.src).toPromise();
    this.selectedVideo = await this.loadMedia(videoSource);
    this.videoPreview = true;
  }

  selectPressReleases(event: Event, pressSelection: string) {
    event.stopPropagation();
    this.pressSelection = pressSelection;
    this.showPressReleases = false;
    this.getPdfImage(); 
  }

  showPdf(event: Event) {
    event.stopPropagation();
    this.pdfPreview = true;
  }

  selectPicturers(event: Event, picturersSelection: string) {
    event.stopPropagation();
    this.picturersSelection = picturersSelection;
    this.getPicturerImages();
  }

  async getPicturerImages() {
    const medias = [];
    let productId = Number(this.mediaCenterState);
    if (productId === 4) {
      productId = 5;
    }
    const product = await this.productService.getProduct(productId);
    const images = product.images.filter(i => i.category === this.picturersSelection);
    for (let i = 0; i < images.length; i++) {
      const imageSrc = product.images[i];
      const image = await this.mediaService.getMedia(imageSrc.src).toPromise();
      const media = await this.loadMedia(image);
      medias.push(media);
    }
    this.picturer = medias;
  }

  showPicturer(event: Event, selectedPicturer: string) {
    event.stopPropagation();
    this.selectedPicturer = selectedPicturer;
  }

  downloadPicturer(event: Event, picUrl?: string) {
    event.stopPropagation();
    if (!picUrl) {
      picUrl = this.selectedPicturer;
    }
    let link = document.createElement("a");
    link.download = this.picturersSelection;
    link.href = picUrl;
    link.click();
  }
  async getPdfImage() {
    let productId = Number(this.mediaCenterState);
    if (productId === 4) {
      productId = 5;
    }
    const product = await this.productService.getProduct(productId);
    const pdf = product.pdfs.find(pdf => pdf.language === this.pressSelection);
    if (pdf) {
      const pdfPreviewSrc = pdf.image.src;
      const image = await this.mediaService.getMedia(pdfPreviewSrc).toPromise();
      const media = await this.loadMedia(image);
      this.pdfPreviewImage = media;
    }
  }
  async downloadPdf(event: Event) {
    event.stopPropagation();
    let productId = Number(this.mediaCenterState);
    if (productId === 4) {
      productId = 5;
    }
    const product = await this.productService.getProduct(productId);
    const pdf = product.pdfs.find(pdf => pdf.language === this.pressSelection);
    const pdfSoruce = await this.mediaService.getMedia(pdf.src).toPromise();
    let link = document.createElement("a");
    link.download = `DP_Hermes_H08_${this.pressSelection}.pdf`;
    link.href = <any>(await this.loadMedia(pdfSoruce));
    link.click();
  }

  clickMediaCenterModal() {
    if (this.pdfPreview) {
      this.pdfPreview = false;
    }
    if (this.selectedPicturer) {
      this.selectedPicturer = null;
    }
    if (this.videoPreview) {
      this.videoPreview = false;
    }
  }

  clickMeetings() {
    this.isInMeetings = true;
    this.isInMediaCenter = false;
    this.isInCreateMeeting = false;
    this.isInMyMeetings = false;
    this.isViewMeeting = false;
    this.isViewSupport = false;
    this.isSuccessSendingInvitation = false;
    this.switchMediaCenterState(null, null);
  }

  showSupportForm() {
    this.isInMeetings = false;
    this.isInCreateMeeting = false;
    this.isInMyMeetings = false;
    this.isViewMeeting = false;
    this.isViewSupport = true;
    this.isSuccessSendingInvitation = false;
  }

  showCreateMeetingForm(event: Event) {
    event.stopPropagation();
    this.isInCreateMeeting = true;
    this.isInMyMeetings = false;
    this.isViewMeeting = false;
    this.isViewSupport = false;
    this.isSuccessSendingInvitation = false;
    this.switchMediaCenterState(null, null);
    this.isInMediaCenter = false;
  }

  async showMyMeetings(event: Event) {
    event.stopPropagation();
    try {
      this.meetings = await this.eventService.getEvents();
    } catch (e) {
      if (e.error.message === 'Expired JWT Token') {
        this.logout();
      }
    }
    this.sortMeetingsByDate();
    this.isInMyMeetings = true;
    this.isInCreateMeeting = false;
    this.isViewMeeting = false;
    this.isSuccessSendingInvitation = false;
    this.switchMediaCenterState(null, null);
    this.isInMediaCenter = false;
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
    // this.preload.loadFile('/assets/img/watch_fluid_1_dec.mp4');
    // this.preload.loadFile('/assets/img/watch_water_4_dec.mp4');
    // this.preload.loadFile('/assets/img/sand_5_dec.mp4');
    this.preload.loadFile('/assets/img/birds_2_dec.mp4');
    // this.preload.loadFile('/assets/img/fluid_2_dec.mp4');
    // this.preload.loadFile('/assets/img/watch_water_3_dec.mp4');
    // this.preload.loadFile('/assets/img/sand_3_dec.mp4');
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

  getLink(meetingUrl: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = `${meetingUrl.replace(/\?shared=\d/, '')}?shared=1`;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.notifier.notify('success', 'You link has been copied.');
  }

  async sendAgain(meeting: MeetingEvent) {
    try {
      await this.eventService.sendAgain(meeting);
      this.notifier.notify('success', 'Your invitation has been sent.');
      this.showMyMeetings(new CustomEvent('click'));
    } catch (e) {
      if (e.error.message === 'Expired JWT Token') {
        this.logout();
      }
    }
  }

  async cancel(meeting: MeetingEvent) {
    if (confirm(`Are you sure you want to cancel meeting with ${meeting.participant.fullName} ?`)) {
      try {
        await this.eventService.cancel(meeting);
        this.notifier.notify('success', 'The event has been canceled.');
        this.showMyMeetings(new CustomEvent('click'));
      } catch (e) {
        if (e.error.message === 'Expired JWT Token') {
          this.logout();
        }
      }
    }
  }

  async findMeeting(id: string) {
    try {
      const meetingEvent = await this.eventService.findEvent(id);

      if (!meetingEvent || meetingEvent.remainingTime > 10) {
        this.clickMeetings();
        this.showMyMeetings(new CustomEvent('click'));
      } else {
        this.clickMeetings();
        this.showMyMeetings(new CustomEvent('click'));

        this.goToMeeting(meetingEvent, true);
      }
    } catch (e) {
      this.clickMeetings();
      this.showMyMeetings(new CustomEvent('click'));
    }
  }

  async goToMeeting(meeting: MeetingEvent, alreadyCheck: boolean = false) {
    if (!meeting.personalRendezVous) {
      window.open(meeting.videoConferenceUrl, '_blank');
    }

    try {
      await this.eventService.getEvent(meeting);
      window.open(meeting.videoConferenceUrl, '_blank');
      /*if (alreadyCheck) {
        this.selectedMeeting = meeting;
      } else {
        this.selectedMeeting = await this.eventService.getEvent(meeting);
      }

      const user = this.authService.getPayload();
      const url = meeting.slug;

      this.startMeeting(url, {
        email: user['email'],
        displayName: `${user['firstName']} ${user['lastName']}`,
      });*/

    } catch (e) {
      console.error(e);
      this.logout();
    }
  }

  startMeeting(url: string = null, userInfo = {}) {
    this.isViewMeeting = true;
    this.isInMediaCenter = true;
    this.isInMeetings = true;
    this.isInCreateMeeting = false;
    this.isInMyMeetings = false;
    this.isViewSupport = false;
    this.isSuccessSendingInvitation = false;

    setTimeout(() => {
      const parent = this.element.nativeElement.querySelector('.viewMeeting,.modal_sq-mobile');
      const viewContainer = this.element.nativeElement.querySelector('#meeting-viewport');
      const fullScreenButton = this.element.nativeElement.querySelector('#fullscreen-button');

      fullScreenButton.onclick = () => {
        if (viewContainer.requestFullscreen) {
          viewContainer.requestFullscreen();
        } else if (viewContainer.webkitRequestFullscreen) {
          viewContainer.webkitRequestFullscreen();
        } else if (viewContainer.msRequestFullscreen) {
          viewContainer.msRequestFullscreen();
        }
      };
      viewContainer.innerHTML = null;
      viewContainer.style.height = `${parent.clientHeight * 0.8 / 2}px`;
      viewContainer.style.backgroundColor = 'white';

      const domain = 'meeting.digiplace.site';
      const options = {
        roomName: url,
        width: '100%',
        height: '100%',
        parentNode: viewContainer,
        userInfo,
      };

      // @ts-ignore
      /*const api = new JitsiMeetExternalAPI(domain, options);

      api.on('readyToClose', () => {
        if (this.authService.isLoggedIn()) {
          this.showMyMeetings(new CustomEvent('click'));
        } else {
          this.router.navigate(['']);
        }
      });*/
    }, 500);
  }
}
