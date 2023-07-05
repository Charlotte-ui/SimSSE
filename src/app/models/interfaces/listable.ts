import { Tag } from '../vertex/tag';
import { Vertex } from '../vertex/vertex';

export interface Listable extends Vertex {
  title: string;
  description: string;
  tags: Map<string,Tag>;
}
