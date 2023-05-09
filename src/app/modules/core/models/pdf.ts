import jsPDF from 'jspdf';
import { Curve } from './curve';
import { Trigger } from './trigger';

export class Pdf {
  static sizes = [12, 16, 20];
  static margin = 10;

  verticalOffset = 40;

  description: string;
  timeStamps: number[];
  triggeredEvents: Trigger[];

  pdf!: jsPDF;

  pageWidth: number;

  constructor(object?, curves?: Curve[]) {
    this.pdf = new jsPDF('p', 'px', 'letter');

    this.description = object?.description ? object.description : '';
    this.timeStamps = object?.timeStamps ? object.timeStamps : [];
    this.triggeredEvents = object?.triggeredEvents
      ? object.triggeredEvents
      : [];

    this.pageWidth = this.pdf.internal.pageSize.width;

    this.addText('EXERCICE ORSEC', 20, true);
    this.verticalOffset += 10;

    this.addText('Nom :                  Prénom : ', 16, true);

    this.verticalOffset += 10;

    this.addText(this.description, 12, false);

    this.verticalOffset += 10;
    this.pdf.line(
      Pdf.margin,
      this.verticalOffset,
      this.pageWidth - 2 * Pdf.margin,
      this.verticalOffset
    ); // horizontal line
    this.verticalOffset += 10;

    this.timeStamps.forEach((timeStamp) => {
      this.addText(`A ${timeStamp} minutes`, 14, false);
      this.addText(`blabla`, 12, false);
      curves.forEach((curve: Curve) => {
        this.addText(
          `${curve.name} : ${curve.values[timeStamp][1]}`,
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
}
