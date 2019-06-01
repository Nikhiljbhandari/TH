import { Injectable } from '@angular/core';
import { Resolve } from "@angular/router";
import { FirebaseService } from '../services/firebase.service';

@Injectable()
export class DetailsResolver implements Resolve<any> {

  constructor(public firebaseService: FirebaseService,) { }

  resolve() {


    return new Promise((resolve, reject) => {
       this.firebaseService.getPeopleDetails().then(data => {
         resolve(data);
      }, err => {
        reject(err);
      });
    })
  }
}
