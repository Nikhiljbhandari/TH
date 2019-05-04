import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { WelcomePage } from './welcome.page';
import { WelcomeResolver } from './welcome.resolver';

const routes: Routes = [
  {
    path: '',
    component: WelcomePage,
    resolve: {
      data: WelcomeResolver
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [WelcomePage],
  providers: [
    WelcomeResolver
  ]
})
export class WelcomePageModule {}
