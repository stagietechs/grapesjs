import { Component, DataSource, DataSourceManager } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import {
  CollectionComponentType,
  CollectionVariableType,
} from '../../../../../src/data_sources/model/collection_component/constants';
import { CollectionStateVariableType } from '../../../../../src/data_sources/model/collection_component/types';
import EditorModel from '../../../../../src/editor/model/Editor';
import { filterObjectForSnapshot, setupTestEditor } from '../../../../common';

describe('Collection component', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;
  let dataSource: DataSource;
  let wrapper: Component;

  beforeEach(() => {
    ({ em, dsm } = setupTestEditor());
    wrapper = em.getWrapper()!;
    dataSource = dsm.add({
      id: 'my_data_source_id',
      records: [
        { id: 'user1', user: 'user1', age: '12' },
        { id: 'user2', user: 'user2', age: '14' },
        { id: 'user3', user: 'user3', age: '16' },
      ],
    });
  });

  afterEach(() => {
    em.destroy();
  });

  describe('Collection symbols', () => {
    test('Basic usage', () => {
      const cmp = wrapper.components({
        type: CollectionComponentType,
        collectionDefinition: {
          block: {
            type: 'default',
          },
          config: {
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];

      expect(cmp.components()).toHaveLength(3);
      const firstChild = cmp.components().at(0);
      const secondChild = cmp.components().at(1);

      expect(firstChild.get('type')).toBe('default');
      expect(secondChild.get('type')).toBe('default');
    });
  });

  describe('Collection variables', () => {
    test('Properties', () => {
      const cmp = wrapper.components({
        type: CollectionComponentType,
        collectionDefinition: {
          block: {
            type: 'default',
            content: {
              type: CollectionVariableType,
              variable_type: CollectionStateVariableType.current_item,
              path: 'user',
            },
            custom_property: {
              type: CollectionVariableType,
              variable_type: CollectionStateVariableType.current_item,
              path: 'user',
            },
          },
          config: {
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];
      const firstChild = cmp.components().at(0);
      const secondChild = cmp.components().at(1);

      expect(firstChild.get('content')).toBe('user1');
      expect(firstChild.get('custom_property')).toBe('user1');

      expect(secondChild.get('content')).toBe('user2');
      expect(secondChild.get('custom_property')).toBe('user2');
    });

    test('Attributes', () => {
      const cmp = wrapper.components({
        type: CollectionComponentType,
        collectionDefinition: {
          block: {
            type: 'default',
            attributes: {
              custom_attribute: {
                type: CollectionVariableType,
                variable_type: CollectionStateVariableType.current_item,
                path: 'user',
              },
            },
          },
          config: {
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];

      const firstChild = cmp.components().at(0);
      const secondChild = cmp.components().at(1);

      expect(firstChild.getAttributes()['custom_attribute']).toBe('user1');

      expect(secondChild.getAttributes()['custom_attribute']).toBe('user2');
    });

    test('Traits', () => {
      const cmp = wrapper.components({
        type: CollectionComponentType,
        collectionDefinition: {
          block: {
            type: 'default',
            traits: [
              {
                name: 'attribute_trait',
                value: {
                  type: CollectionVariableType,
                  variable_type: CollectionStateVariableType.current_item,
                  path: 'user',
                },
              },
              {
                name: 'property_trait',
                changeProp: true,
                value: {
                  type: CollectionVariableType,
                  variable_type: CollectionStateVariableType.current_item,
                  path: 'user',
                },
              },
            ],
          },
          config: {
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];

      expect(cmp.components()).toHaveLength(3);
      const firstChild = cmp.components().at(0);
      const secondChild = cmp.components().at(1);

      expect(firstChild.getAttributes()['attribute_trait']).toBe('user1');
      expect(firstChild.get('property_trait')).toBe('user1');

      expect(secondChild.getAttributes()['attribute_trait']).toBe('user2');
      expect(secondChild.get('property_trait')).toBe('user2');
    });
  });

  describe('Stringfication', () => {
    test('Collection with dynamic datasource', () => {
      const cmp = wrapper.components({
        type: CollectionComponentType,
        collectionDefinition: {
          collection_name: 'my_collection',
          block: {
            type: 'default',
            content: {
              type: CollectionVariableType,
              variable_type: CollectionStateVariableType.current_item,
              path: 'user',
            },
            attributes: {
              content: {
                type: CollectionVariableType,
                variable_type: CollectionStateVariableType.current_item,
                path: 'user',
              },
            },
            traits: [
              {
                name: 'attribute_trait',
                value: {
                  type: CollectionVariableType,
                  variable_type: CollectionStateVariableType.current_item,
                  path: 'user',
                },
              },
              {
                name: 'property_trait',
                changeProp: true,
                value: {
                  type: CollectionVariableType,
                  variable_type: CollectionStateVariableType.current_item,
                  path: 'user',
                },
              },
            ],
          },
          config: {
            start_index: 0,
            end_index: 1,
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];

      const json = cmp.toJSON();
      expect(filterObjectForSnapshot(json)).toMatchSnapshot();
    });
  });

  describe('Configuration options', () => {
    test('Collection with start and end indexes', () => {
      const cmp = wrapper.components({
        type: CollectionComponentType,
        collectionDefinition: {
          block: {
            type: 'default',
            content: {
              type: CollectionVariableType,
              variable_type: CollectionStateVariableType.current_item,
              path: 'user',
            },
          },
          config: {
            start_index: 1,
            end_index: 2,
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];

      expect(cmp.components()).toHaveLength(2);
      const firstChild = cmp.components().at(0);
      const secondChild = cmp.components().at(1);

      expect(firstChild.get('content')).toBe('user2');
      expect(secondChild.get('content')).toBe('user3');
    });
  });

  describe('Diffirent Collection variable types', () => {
    const stateVariableTests = [
      { variableType: CollectionStateVariableType.current_index, expectedValues: [0, 1, 2] },
      { variableType: CollectionStateVariableType.start_index, expectedValues: [0, 0, 0] },
      { variableType: CollectionStateVariableType.end_index, expectedValues: [2, 2, 2] },
      {
        variableType: CollectionStateVariableType.collection_name,
        expectedValues: ['my_collection', 'my_collection', 'my_collection'],
      },
      { variableType: CollectionStateVariableType.total_items, expectedValues: [3, 3, 3] },
      { variableType: CollectionStateVariableType.remaining_items, expectedValues: [2, 1, 0] },
    ];

    stateVariableTests.forEach(({ variableType, expectedValues }) => {
      test(`Variable type: ${variableType}`, () => {
        const cmp = wrapper.components({
          type: CollectionComponentType,
          collectionDefinition: {
            collection_name: 'my_collection',
            block: {
              type: 'default',
              content: {
                type: CollectionVariableType,
                variable_type: variableType,
              },
            },
            config: {
              dataSource: {
                type: DataVariableType,
                path: 'my_data_source_id',
              },
            },
          },
        })[0];

        const children = cmp.components();
        expect(children).toHaveLength(3);

        children.each((child, index) => {
          expect(child.get('content')).toBe(expectedValues[index]);
        });
      });
    });
  });
});
