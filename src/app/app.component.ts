import { ResponsiveService } from './shared/responsive.service';
import { EventService } from './shared/event.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private responsiveService: ResponsiveService){
  }

  ngOnInit(){
    // this.responsiveService.getMobileStatus().subscribe( isMobile =>{
    //   if(isMobile){
    //     console.log('Mobile device detected')
    //   }
    //   else{
    //     console.log('Desktop detected')
    //   }
    // });
    this.onResize();
  }

  onResize(){
    this.responsiveService.checkWidth();
  }
}
