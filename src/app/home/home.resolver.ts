import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Injectable()
export class HomeResolver implements Resolve<any> {

  constructor(private firebaseService: FirebaseService) {}

  resolve(route: ActivatedRouteSnapshot) {
        let itemId = route.paramMap.get('themeId'); //'3fiJ6EsKXCrTbYmHEt2T';
    console.log(itemId);
    return new Promise((resolve, reject) => {
     this.firebaseService.getEvents().then(data => {
      data.themeId= itemId;
      resolve(data);
    }, err => {
      reject(err);
    });
    })
  }
}
