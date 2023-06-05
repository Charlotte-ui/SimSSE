import jsPDF from 'jspdf';
import { Curve } from '../functions/curve';
import { Timestamp, Trigger } from './trigger';
import { Profil } from './vertex/profil';
import { Modele } from './vertex/modele';

export class Pdf {
  static sizes = [12, 16, 20];
  static margin = 10;

  verticalOffset = 40;

  description: string;
  age: number;
  timeStamps: Timestamp[];
  triggeredEvents: Trigger[];

  pdf!: jsPDF;

  pageWidth: number;

  constructor(modele?:Modele, profil?:Profil, curves?: Curve[]) {
    this.pdf = new jsPDF('p', 'px', 'letter');

    this.description = modele?.description ? modele.description : '';
    this.age = profil?.age ? profil.age : undefined;
    this.timeStamps = modele?.timeStamps ? modele.timeStamps : [];
    this.triggeredEvents = modele?.triggeredEvents
      ? modele.triggeredEvents
      : [];

    this.pageWidth = this.pdf.internal.pageSize.width;

    this.addParagraph('EXERCICE ORSEC', 20, true);
    this.addParagraph('Fiche Plastron', 16, true);

    this.addParagraph('Nom :                  Prénom : ', 16, true);

    this.addIdentiteDescription()

    this.pdf.line(
      Pdf.margin,
      this.verticalOffset,
      this.pageWidth - 2 * Pdf.margin,
      this.verticalOffset
    ); // horizontal line
    this.verticalOffset += 10;

    this.timeStamps.forEach((timeStamp:Timestamp) => {
     
      console.log("timeStamp ",timeStamp)
      this.addPage()
      this.addParagraph(timeStamp.name, 20, true);
      this.addParagraph(`(a ${timeStamp.time} minutes)`, 14, false);
      this.addIdentiteDescription()
      curves.forEach((curve: Curve) => {
        this.addText(
          `${curve.name} : ${curve.values[timeStamp.time][1]}`,
          12,
          false
        );
      });

      this.addLine();
    });

    // this.pdf.rect(15, 30, 180, 15); // empty square

    // Don't want to preset font, size to calculate the lines?
    // .splitTextToSize(text, maxsize, options)
    // allows you to pass an object with any of the following:
    // {
    // 	'fontSize': 12
    // 	, 'fontStyle': 'Italic'
    // 	, 'fontName': 'Times'
    // }
    // Without these, .splitTextToSize will use current / default
    // font Family, Style, Size.

    this.pdf.save('Test.pdf');
  }

  addText(text: string, fontSize: number, center: boolean) {
    let xOffset = center
      ? this.pageWidth / 2 - (this.pdf.getStringUnitWidth(text) * fontSize) / 2
      : Pdf.margin;

    let lines = this.pdf
      .setFontSize(fontSize)
      .splitTextToSize(text, this.pageWidth - Pdf.margin * 2);

    this.pdf.text(lines, xOffset, this.verticalOffset + fontSize / 72);

    this.verticalOffset += lines.length * fontSize;
  }

  addParagraph(text: string, fontSize: number, center: boolean){
    this.addText(text,fontSize,center)
    this.verticalOffset += 10;
  }

  addLine() {
    this.verticalOffset += 10;
    this.pdf.line(
      Pdf.margin,
      this.verticalOffset,
      this.pageWidth - 2 * Pdf.margin,
      this.verticalOffset
    ); // horizontal line
    this.verticalOffset += 10;
  }

  addPage(){
    this.pdf.addPage()
    this.verticalOffset = 40;
  }

  addIdentiteDescription(){
    this.addLine();
    this.addText("Identité plastron: ", 12, false);
    this.addParagraph("Âge : "+this.age.toString(), 12, false);
    this.addLine();
    this.addParagraph(this.description, 12, false);
  }
}
