import { Collection } from '../../services/firebase.service';
import { Tag } from '../vertex/tag';

export interface Listable extends Collection {
  title: string;
  description: string;
  tags: Tag[];
}
