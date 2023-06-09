import { Component, EventEmitter, Input, Output } from '@angular/core';

import {
  ImageService,
  Image,
  ImageRole,
  ImageObject,
} from 'src/app/services/image.service';
import { getElementByChamp } from 'src/app/functions/tools';
import { Observable, concat, concatMap, from, zipAll } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Scenario } from 'src/app/models/vertex/scenario';
import { Tag } from 'src/app/models/vertex/tag';
import { ScenarioService } from 'src/app/services/scenario.service';
import { TagService } from 'src/app/services/tag.service';

@Component({
  selector: 'app-general-infos',
  templateUrl: './general-infos.component.html',
  styleUrls: ['./general-infos.component.less'],
})
export class GeneralInfosComponent {
  scenarioFormGroup;
  allTags;
  displayedColumns: string[] = [
    'title',
    'total',
    'totalParticipant',
    'totalPlastron',
    'totalManequin',
  ];

  imageObjects: ImageObject[];

  dataTotal = [
    {
      title: '',
      total: 0,
      totalPlastron: 0,
      totalParticipant: 0,
      totalManequin: 0,
    },
  ];

  images: Image[] = [];
  image: Image;
  mapImage!: Image;
  coverImage!: Image;
  oldMapImage!: Image;
  oldCoverImage!: Image;

  _scenario: Scenario;

  get scenario(): Scenario {
    return this._scenario;
  }
  @Input() set scenario(value: Scenario) {
    if (value) {
      // if value isnt undefined
      this._scenario = value;

      let scenarioGenalInfo = structuredClone(value);
      delete scenarioGenalInfo.coordPMA; // les coordonnées sont gérées dans groupes
      delete scenarioGenalInfo.coordCADI;
      delete scenarioGenalInfo.coordPRV;

      this.scenarioFormGroup = this.form.group(scenarioGenalInfo);

      this.scenarioFormGroup.valueChanges.subscribe((newScenario: Scenario) => {
        this.scenario.title = newScenario.title;
        this.scenario.description = newScenario.description;
        this.scenario.implique = newScenario.implique;
        this.scenario.psy = newScenario.psy;
        this.scenario.EU = newScenario.EU;
        this.scenario.UA = newScenario.UA;
        this.scenario.UR = newScenario.UR;
        this.scenario.duration = newScenario.duration;

        this.updateScenario.emit(newScenario);
        this.calculTotalPlastron(newScenario);
        this.newTotalPlastron.emit(this.dataTotal[0].totalPlastron);
      });

      this.calculTotalPlastron(value);
      this.newTotalPlastron.emit(this.dataTotal[0].totalPlastron);

      // get the scenario images
      this.imageService
        .getImages(this.scenario.id, 'Scenario')
        .subscribe((images: Image[]) => {
          if (images) {
            this.images = images;
            this.imageObjects = this.imageService.wrapImagesInObject(images);

            this.mapImage = getElementByChamp<Image>(
              this.images,
              'role',
              ImageRole.map
            );
            this.coverImage = getElementByChamp<Image>(
              this.images,
              'role',
              ImageRole.cover
            );
            this.oldCoverImage = structuredClone(this.coverImage);
            this.oldMapImage = structuredClone(this.mapImage);
            this.map.emit(this.mapImage);
          }
        });
    }
  }

  @Output() newTotalPlastron = new EventEmitter<number>();
  @Output() updateScenario = new EventEmitter<Scenario>();
  @Output() updateTags = new EventEmitter<Tag[]>();
  @Output() map = new EventEmitter<Image>();

  constructor(
    private form: FormBuilder,
    public scenarioService: ScenarioService,
    public tagService: TagService,
    private imageService: ImageService
  ) {
    this.tagService.getAllTags('scenario').subscribe((response) => {
      this.allTags = response;
    });
  }

  calculTotalPlastron(scenario: Scenario) {
    this.dataTotal[0].totalPlastron = scenario.EU + scenario.UA + scenario.UR;
    this.dataTotal[0].totalParticipant =
      this.dataTotal[0].totalPlastron + scenario.implique + scenario.psy;
    this.dataTotal[0].totalManequin = scenario.decede;
    this.dataTotal[0].total =
      this.dataTotal[0].totalParticipant + this.dataTotal[0].totalManequin;
  }

  addImage(event: any) {
    let requests: Observable<Image>[] = [];
    let files: File[] = Array.from(event.target.files);

    files.forEach((file: File, index: number) => {
      const reader = new FileReader();

      let image = {} as Image;
      image.name = file.name;
      this.image = image;

      (reader.onload = (e) => {
        image.src = reader.result;

        requests.push(this.imageService.postFile(image, this.scenario.id));
        if (index == files.length - 1) {
          from(requests)
            .pipe(concatMap((request: Observable<Image>) => request))
            .subscribe((res) => {
              console.log(res);
              this.images.push(res);
            });
        }
      }),
        (error) => {
          console.log(error);
        };

      reader.readAsDataURL(file);
    });
  }

  changeMap(event) {
    if (this.oldMapImage)
      this.imageService
        .updateRole(this.scenario.id, this.oldMapImage, ImageRole.none)
        .subscribe();
    this.imageService
      .updateRole(this.scenario.id, event.value, ImageRole.map)
      .subscribe();

    this.map.emit(this.mapImage);

    this.oldMapImage = event.value;
  }

  changeCover(event) {
    if (this.oldCoverImage)
      this.imageService
        .updateRole(this.scenario.id, this.oldCoverImage, ImageRole.none)
        .subscribe();

    this.imageService
      .updateRole(this.scenario.id, event.value, ImageRole.cover)
      .subscribe();

    this.oldCoverImage = event.value;
  }
}
