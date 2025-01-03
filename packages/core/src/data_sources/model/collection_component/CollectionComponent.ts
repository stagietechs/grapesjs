import { DataVariableType } from './../DataVariable';
import { isArray } from 'underscore';
import Component from '../../../dom_components/model/Component';
import { ComponentDefinition, ComponentOptions, ComponentProperties } from '../../../dom_components/model/types';
import { toLowerCase } from '../../../utils/mixins';
import DataSource from '../DataSource';
import { ObjectAny } from '../../../common';
import EditorModel from '../../../editor/model/Editor';
import { keyCollectionsStateMap } from '../../../dom_components/model/Component';
import { CollectionDefinition, CollectionState, CollectionsStateMap } from './types';
import { keyCollectionDefinition, keyInnerCollectionState, CollectionComponentType } from './constants';

export default class CollectionComponent extends Component {
  constructor(props: CollectionDefinition & ComponentProperties, opt: ComponentOptions) {
    const em = opt.em;
    const { collection_name, block, config } = props[keyCollectionDefinition];
    if (!block) {
      throw new Error('The "block" property is required in the collection definition.');
    }

    if (!config?.dataSource) {
      throw new Error('The "config.dataSource" property is required in the collection definition.');
    }

    let items: any[] = getDataSourceItems(config.dataSource, em);
    const components: ComponentDefinition[] = [];
    const start_index = Math.max(0, config.start_index || 0);
    const end_index = Math.min(items.length - 1, config.end_index || Number.MAX_VALUE);

    const total_items = end_index - start_index + 1;
    let blockComponent: Component;
    for (let index = start_index; index <= end_index; index++) {
      const item = items[index];
      const collectionState: CollectionState = {
        collection_name,
        current_index: index,
        current_item: item,
        start_index: start_index,
        end_index: end_index,
        total_items: total_items,
        remaining_items: total_items - (index + 1),
      };

      const collectionsStateMap: CollectionsStateMap = {
        ...props[keyCollectionsStateMap],
        ...(collection_name && { [collection_name]: collectionState }),
        [keyInnerCollectionState]: collectionState,
      };

      if (index === start_index) {
        const type = em.Components.getType(block?.type || 'default');
        const model = type.model;
        blockComponent = new model(
          {
            ...block,
            [keyCollectionsStateMap]: collectionsStateMap,
          },
          opt,
        );
      }
      const instance = em.Components.addSymbol(blockComponent!);
      const cmpDefinition = resolveComponent(instance!, block, collectionsStateMap, em);

      components.push(cmpDefinition);
    }

    const conditionalCmptDef = {
      ...props,
      type: CollectionComponentType,
      components: components,
      dropbbable: false,
    };
    // @ts-ignore
    super(conditionalCmptDef, opt);
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === CollectionComponentType;
  }
}

function getDataSourceItems(dataSource: any, em: EditorModel) {
  let items: any[] = [];
  switch (true) {
    case isArray(dataSource):
      items = dataSource;
      break;
    case typeof dataSource === 'object' && dataSource instanceof DataSource:
      const id = dataSource.get('id')!;
      items = listDataSourceVariables(id, em);
      break;
    case typeof dataSource === 'object' && dataSource.type === DataVariableType:
      const isDataSourceId = dataSource.path.split('.').length === 1;
      if (isDataSourceId) {
        const id = dataSource.path;
        items = listDataSourceVariables(id, em);
      } else {
        // Path points to a record in the data source
        items = em.DataSources.getValue(dataSource.path, []);
      }
      break;
    default:
  }
  return items;
}

function listDataSourceVariables(dataSource_id: string, em: EditorModel) {
  const records = em.DataSources.getValue(dataSource_id, []);
  const keys = Object.keys(records);

  return keys.map((key) => ({
    type: DataVariableType,
    path: dataSource_id + '.' + key,
  }));
}

function resolveComponent(
  component: Component,
  block: ComponentDefinition,
  collectionsStateMap: CollectionsStateMap,
  em: EditorModel,
) {
  // @ts-ignore
  component!.set(block);

  const children: ComponentDefinition[] = [];
  for (let index = 0; index < component!.components().length; index++) {
    const childSymbol = component!.components().at(index);
    const childBlock = block['components']![index];
    const childJSON = resolveComponent(childSymbol, childBlock, collectionsStateMap, em);
    children.push(childJSON);
  }

  const componentJSON = component!.toJSON();
  const componentDefinition: ComponentDefinition = {
    ...componentJSON,
    components: children,
    [keyCollectionsStateMap]: collectionsStateMap,
  };

  return componentDefinition;
}
