import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { map, mergeMap,take  } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { FieldPath, FieldValue } from 'firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export interface Collection{
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private db: AngularFirestore) { }



  getCurrentFirebaseUser() {
    return getAuth().currentUser;
  }

  getCurrentFirebaseUserUid() {
    return getAuth().currentUser?.uid as string;
  }



/**
   * renvoi l'ensemble des document d'une collection en fonction de son id
   * @param collection 
   * @returns 
   */
getCollectionById<T extends Collection>(collection:string): Observable<T[]> {
  return this.db.collection(collection).snapshotChanges().pipe(
    take(2),
    map((actions) => {
      return actions.map((a: any) => {
        const data = a.payload.doc.data() as T;
        data.id = a.payload.doc.id;
        return data;
      });
    })
  );
}

  /**
   * renvoi un element d'une collection en fonction de son id
   * @param collection 
   * @param elementId 
   * @returns 
   */
  getElementInCollectionByIds<T extends Collection>(collection:string,elementId:string): Observable<T| undefined> {
    console.log(collection)
    console.log(elementId)
    return this.db.doc<T>(`${collection}/${elementId}`).valueChanges();
  }

  /**
   * renvoi les elements d'une collection dont la valeur de champ est égale à value
   * @param collection 
   * @param champ 
   * @param value 
   * @returns 
   */
  getElementInCollectionByMatchingChamp<T extends Collection>(collection:string,champ:string,value:string|number): Observable<T[]| undefined> {
    return this.db.collection(collection, (ref) => ref.where(champ, '==', value)).snapshotChanges().pipe(
      take(2),
      map((actions) => {
        return actions.map((a: any) => {
          console.log("data");
          console.log(a.payload.doc.data());
          const data = a.payload.doc.data() as T;
          data.id = a.payload.doc.id;
          return data;
        });
      })
    );
  }

 /**
    * update a document in a collection
    * @param collection 
    * @param newElement 
    * @param elementId 
    * @returns 
    */
 public updateElementToCollection<T>(collection:string, newElement: any, elementId:string) :Promise<void>{
  return  this.db.doc<T>(`${collection}/${elementId}`).update(newElement);
}  


  /**
    * delete a document in a collection
    * @param collection 
    * @param id 
    * @returns 
    */
  public deleteElementInCollection(collection:string, id: string) : Promise<void>{
    return this.db.collection(collection).doc(id).delete();
  }


  public connexion(pseudo:string,password:string):Promise<firebase.auth.UserCredential>{
    return firebase.auth().signInWithEmailAndPassword(pseudo+"@mail.fr",password);
  }





}
