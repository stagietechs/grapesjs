import { CollectionComponentType } from './constants';

import { ComponentDefinition } from '../../../dom_components/model/types';
import { CollectionVariableDefinition } from '../../../../test/specs/dom_components/model/ComponentTypes';
import { DataVariableDefinition } from '../DataVariable';
import { ConditionDefinition } from '../conditional_variables/DataCondition';

type CollectionDataSource = any[] | DataVariableDefinition | CollectionVariableDefinition;
type CollectionConfig = {
  start_index?: number;
  end_index?: number | ConditionDefinition;
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

export type CollectionDefinition = {
  type: typeof CollectionComponentType;
  collection_name?: string;
  config: CollectionConfig;
  block: ComponentDefinition;
};
