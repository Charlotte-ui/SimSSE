import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { getElementByChamp, orderBy } from '../functions/tools';

export enum ImageRole {
  none = 'none',
  cover = 'cover',
  map = 'map',
}

export interface Image {
  name: string;
  id: string;
  src: string | ArrayBuffer;
  role: ImageRole;
}

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(private apiService: ApiService) {}

  getImages(sourceId: string, classe: string): Observable<Image[]> {
    return this.apiService
      .getLinkAndRelationFrom(sourceId, 'aImage', classe)
      .pipe(
        map((response) => {
          console.log(response);
          let res = response.result[0];
          let images = orderBy<Image>(res.$a, '@rid');
          let liens = orderBy<any>(res.$b, 'in');
          return images.map((response: any, index: number) => {
            let image = {} as Image;
            image.name = response.name;
            image.id = this.apiService.documentId(response);
            image.src = response.src;
            image.role = liens[index].role;
            return image;
          });
        })
      );
  }

  /**
   * get the cover image of a scenario
   * @param sourceId
   */
  getImageCover(sourceId: string): Observable<Image | undefined> {
    return this.apiService
      .getRelationFromWhithMatchingChamp<Image>(
        sourceId,
        'aImage',
        'Scenario',
        'role',
        ImageRole.cover
      )
  }

  /**
   * create an image in the bdd and lonk it to the source. Return the id of the new image.
   * @param file
   * @param sourceId
   * @returns
   */
  postFile(file: any, sourceId: string): Observable<Image> {
    console.log('postFile ', file);
    let image = {} as Image;
    image['@class'] = 'Image';
    image.src = file.src;
    image.name = file.name;
    console.log('fileToUpload ', image);
    return this.apiService
      .createDocument(image)
      .pipe(map((response) => this.apiService.documentId(response)))
      .pipe(
        switchMap((imageId: string) =>
          this.apiService
            .createRelationBetweenWithProperty(
              imageId,
              sourceId,
              'aImage',
              'role',
              ImageRole.none
            )
            .pipe(
              map(() => {
                image.id = imageId;
                return image;
              })
            )
        )
      );
  }

  updateRole(idSource: string, image: Image, role: ImageRole): Observable<any> {
    return this.apiService
      .getLinkBetween(image.id, idSource, 'aImage')
      .pipe(map((response) => this.apiService.documentId(response.result[0])))
      .pipe(
        switchMap((idLink) =>
          this.apiService.updateDocumentChamp(idLink, 'role', role)
        )
      );
    //
  }
}
