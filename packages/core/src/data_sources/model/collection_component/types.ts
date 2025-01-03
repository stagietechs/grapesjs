import { CollectionComponentType, keyCollectionDefinition } from './constants';

import { ComponentDefinition, ComponentProperties } from '../../../dom_components/model/types';
import { CollectionVariableDefinition } from '../../../../test/specs/dom_components/model/ComponentTypes';
import { DataVariableDefinition } from '../DataVariable';

type CollectionDataSource = any[] | DataVariableDefinition | CollectionVariableDefinition;
type CollectionConfig = {
  start_index?: number;
  end_index?: number;
  dataSource: CollectionDataSource;
};

export type CollectionState = {
  current_index: number;
  start_index: number;
  current_item: any;
  end_index: number;
  collection_name?: string;
  total_items: number;
  remaining_items: number;
};

export type CollectionsStateMap = {
  [key: string]: CollectionState;
};

export type CollectionComponentDefinition = {
  [keyCollectionDefinition]: CollectionDefinition;
} & ComponentDefinition;

export type CollectionDefinition = {
  type: typeof CollectionComponentType;
  collection_name?: string;
  config: CollectionConfig;
  block: ComponentDefinition;
};
