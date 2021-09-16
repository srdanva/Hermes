import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutRoutingModule } from './layout-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { AccountComponent } from './account/account.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [LayoutComponent, MainComponent, AccountComponent],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatOptionModule
  ]
})
export class LayoutModule { }
