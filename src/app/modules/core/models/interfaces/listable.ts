import { Collection } from '../../services/firebase.service';
import { Tag } from '../tag';

export interface Listable extends Collection {
  title: string;
  description: string;
  tags: Tag[];
}
