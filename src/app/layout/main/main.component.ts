import { DeviceDetectorService } from 'ngx-device-detector';
import { ResponsiveService } from './../../shared/responsive.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import * as createjs from 'createjs-module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/auth.service';
import { ActivatedRoute, Router } from "@angular/router";
import { NotifierService } from "angular-notifier";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  @ViewChild('progress')
  progress: ElementRef<any>;

  loginForm: FormGroup;
  setNewPasswordForm: FormGroup;
  muted = true;
  isNewUser = false;
  isGuest = true;
  newPasswordSet = false;
  isMobile: boolean;
  token?: string;

  preload = new createjs.LoadQueue();
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private responsiveService: ResponsiveService,
    private devieService: DeviceDetectorService,
    private notifier: NotifierService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    (<any>window).createjs = createjs;
    this.preload = new createjs.LoadQueue(false);

    this.route.queryParams
        .subscribe(params => {
          if (params.shared) {
            this.router.navigateByUrl(`layout${location.search}`);
          } else if (params.token) {
            this.token = params.token;
          }
        });

    window.addEventListener("scroll", () => {
      gsap.TweenLite.set('.progress_line', { height: scrollY / 9 + "px" });
    });
  }

  ngOnInit() {
    this.preloadResouces();
    // this.initGsap();
    this.isMobile = this.devieService.isMobile();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.setNewPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      repeatPassword: ['', Validators.required]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async login() {
    try {
      const res = await this.authService.login({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      });

      if (res === 'newUser') {
        this.isNewUser = true;
      }
    } catch (e) {
      if (this.isGuest) {
        this.isGuest = false;
      } else {
        this.loginForm.get('password').setErrors({ 'badCredentials': 'Bad credentials' });
      }
    }
  }

  async setNewPassword() {
    if (this.setNewPasswordForm.valid) {
      if (this.setNewPasswordForm.value.newPassword !== this.setNewPasswordForm.value.repeatPassword) {
        this.setNewPasswordForm.get('repeatPassword').setErrors({ 'repeatError': 'Password does not match' });
      } else {
        await this.authService.setNewPassword({ email: this.loginForm.get('email').value, password: this.setNewPasswordForm.value.newPassword }, this.token);
        this.isNewUser = false;
        this.newPasswordSet = true;
        this.isGuest = false;
      }
    }
  }

  async resetPasswordRequest() {
    if (this.loginForm.value.email) {
      await this.authService.setNewPassword({ email: this.loginForm.value.email });
      this.notifier.notify('success', 'Your reset password request has been sent, check your emails.')
    }
  }

  get repeatPassword() {
    return this.setNewPasswordForm.get('repeatPassword');
  }

  ngOnDestroy() {
    this.preload.removeAllEventListeners();
    (<any>window).createjs = null;
  }

  loginButtonClick() {
    document.querySelector('body').style.overflow = "hidden";
    this.isNewUser = false;
    this.newPasswordSet = false;
    if (!this.isMobile) {
      gsap.default.set('.modal_login', { autoAlpha: 1 });
      gsap.default.to('.modal_login', { scale: 1, duration: 0.3 });
      gsap.default.to('.login_btn', { border: 1, duration: 0.3 });
    } else {
      gsap.default.set('.modal_login-mobile', { autoAlpha: 1 });
      gsap.default.to('.modal_login-mobile', { scale: 1, duration: 0.3 });
      gsap.default.to('.login_btn-mobile', { border: 1, duration: 0.3 });
    }
  }

  preloadResouces() {
    // this.preload.loadFile('/assets/img/watch_water_3.mp4');
    // this.preload.loadFile('/assets/img/watch_water_4.mp4');
    // this.preload.loadFile('/assets/img/watch_sand_3.mp4');
    // this.preload.loadFile('/assets/img/drops_3.mp4');
    // this.preload.loadFile('/assets/img/sand_5.mp4');
    // this.preload.loadFile('/assets/img/GIF05_short.mp4');
    // this.preload.loadFile('/assets/img/watch_sand_5.mp4');
    this.preload.loadFile('/assets/img/LP_Background.mp4');
    this.preload.on("progress", (event: any) => {
      let progress = Math.floor(event.progress * 100);
      this.progress.nativeElement.style.width = progress + "%";
      if (progress == 100) {
        gsap.default.to('.preloader_overlay img', { autoAlpha: 0, duration: 0.9 });
        gsap.default.to('.preloader_overlay', { background: '#000', autoAlpha: 0, duration: 1, delay: 1 });
      }
    });
    this.preload.on('complete', () => {
      if (this.token) {
        this.loginButtonClick();
        this.isNewUser = true;
      }
    });
    // document.querySelector('.login_btn').addEventListener("click", () => {
    //   document.querySelector('body').style.overflow = "hidden";
    //   this.isNewUser = false;
    //   this.newPasswordSet = false;
    //   gsap.default.set('.modal_login', { autoAlpha: 1 });
    //   gsap.default.to('.modal_login', { scale: 1, duration: 0.3 });
    //   gsap.default.to('.login_btn', { border: 1, duration: 0.3 });
    // });
  }

  // initGsap() {
  //   gsap.default.registerPlugin(ScrollTrigger);
  //   gsap.default.to('.wheel', { y: 20, repeat: -1, repeatDelay: 1, duration: 1, yoyo: true });
  //   gsap.default.fromTo(".firstV", {
  //     y: -374,
  //   }, {
  //     y: window.innerHeight * 6,
  //     scrollTrigger: {
  //       trigger: ".video_block",
  //       start: "1px top",
  //       end: "+=900%",
  //       onEnter: () => { },
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".secondV", {
  //     y: window.innerHeight
  //   }, {
  //     y: -window.innerHeight * 6,
  //     scrollTrigger: {
  //       trigger: ".video_block",
  //       start: "1px top",
  //       end: "+=900%",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".thirdV", {
  //     y: window.innerHeight
  //   }, {
  //     y: -window.innerHeight,
  //     scrollTrigger: {
  //       trigger: ".video_block",
  //       start: "1px top",
  //       end: "+=500%",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".thirdV .hermes-small", {
  //     scale: 1
  //   }, {
  //     scale: 1.3,
  //     scrollTrigger: {
  //       trigger: ".thirdV",
  //       start: "top 30%",
  //       end: "+=10px",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".fourV", {
  //     y: window.innerHeight / 3
  //   }, {
  //     y: window.innerHeight * 8,
  //     scrollTrigger: {
  //       trigger: ".thirdV",
  //       start: "top 20%",
  //       end: "+=4900%",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".fourV .hermes-small ", {
  //     scale: 0
  //   }, {
  //     scale: 1.3,
  //     scrollTrigger: {
  //       trigger: ".thirdV",
  //       start: "top 30%",
  //       end: "+=10px",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".fiveV", {
  //     y: -window.innerHeight
  //   }, {
  //     y: window.innerHeight * 5,
  //     scrollTrigger: {
  //       trigger: ".thirdV",
  //       start: "top 80%",
  //       end: "+=900%",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".sixV", {
  //     scale: 0,
  //     xPercent: -50, yPercent: -50
  //   }, {
  //     scale: 1, xPercent: -60, yPercent: -20,
  //     scrollTrigger: {
  //       trigger: ".thirdV .hermes-small",
  //       start: "bottom+=160% 0%",
  //       end: "+=10",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".sixV .text", {
  //     y: 0,
  //   }, {
  //     y: -1000,
  //     scrollTrigger: {
  //       trigger: ".thirdV .hermes-small",
  //       start: "bottom+=160% 0%",
  //       end: "+=1900%",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".sevenV ", {
  //     scale: 0
  //   }, {
  //     scale: 1,
  //     scrollTrigger: {
  //       trigger: ".thirdV .hermes-small",
  //       start: "bottom+=300% 0%",
  //       end: "+=10",
  //       scrub: 1.3
  //     }
  //   });
  //   gsap.default.fromTo(".sixV .hermes-wrap", {
  //     scale: 1
  //   }, {
  //     scale: 0,
  //     scrollTrigger: {
  //       trigger: ".thirdV .hermes-small",
  //       start: "bottom+=600% 0%",
  //       end: "+=10",
  //       scrub: 1.3
  //     }
  //   });
  // }
}

