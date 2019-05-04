import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Injectable()
export class HomeResolver implements Resolve<any> {

  constructor(private firebaseService: FirebaseService) {}

  resolve() {
        let itemId = '3fiJ6EsKXCrTbYmHEt2T';//route.paramMap.get('themeId');
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
