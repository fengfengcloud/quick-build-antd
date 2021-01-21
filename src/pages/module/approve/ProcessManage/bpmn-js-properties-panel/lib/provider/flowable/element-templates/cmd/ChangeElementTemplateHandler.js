'use strict';

var findExtension = require('../Helper').findExtension,
    findExtensions = require('../Helper').findExtensions;

var createFlowableProperty = require('../CreateHelper').createFlowableProperty,
    createInputParameter = require('../CreateHelper').createInputParameter,
    createOutputParameter = require('../CreateHelper').createOutputParameter,
    createFlowableIn = require('../CreateHelper').createFlowableIn,
    createFlowableOut = require('../CreateHelper').createFlowableOut,
    createFlowableInWithBusinessKey = require('../CreateHelper').createFlowableInWithBusinessKey,
    createFlowableExecutionListenerScript = require('../CreateHelper').createFlowableExecutionListenerScript,
    createFlowableFieldInjection = require('../CreateHelper').createFlowableFieldInjection;

var forEach = require('lodash/forEach');

var FLOWABLE_SERVICE_TASK_LIKE = [
  'activiti:class',
  'activiti:delegateExpression',
  'activiti:expression'
];

/**
 * A handler that changes the modeling template of a BPMN element.
 */
function ChangeElementTemplateHandler(modeling, commandStack, bpmnFactory) {

  function getOrCreateExtensionElements(element) {

    var bo = element.businessObject;

    var extensionElements = bo.extensionElements;

    // add extension elements
    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });

      modeling.updateProperties(element, {
        extensionElements: extensionElements
      });
    }

    return extensionElements;
  }

  function updateModelerTemplate(element, newTemplate) {
    modeling.updateProperties(element, {
      'activiti:modelerTemplate': newTemplate && newTemplate.id
    });
  }

  function updateIoMappings(element, newTemplate, context) {

    var newMappings = createInputOutputMappings(newTemplate, bpmnFactory),
        oldMappings;

    if (!newMappings) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { inputOutput: newMappings }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldMappings = findExtension(element, 'activiti:InputOutput');
      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: [ newMappings ],
        objectsToRemove: oldMappings ? [ oldMappings ] : []
      });
    }
  }

  function updateFlowableField(element, newTemplate, context) {

    var newMappings = createFlowableFieldInjections(newTemplate, bpmnFactory),
        oldMappings;

    if (!newMappings) {
      return;
    }
    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { field: newMappings }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldMappings = findExtensions(element, ['activiti:Field']);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newMappings,
        objectsToRemove: oldMappings ? oldMappings : []
      });
    }
  }


  function updateFlowableProperties(element, newTemplate, context) {

    var newProperties = createFlowableProperties(newTemplate, bpmnFactory),
        oldProperties;

    if (!newProperties) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { properties: newProperties }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldProperties = findExtension(element, 'activiti:Properties');

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: [ newProperties ],
        objectsToRemove: oldProperties ? [ oldProperties ] : []
      });
    }
  }

  function updateProperties(element, newTemplate, context) {

    var newProperties = createBpmnPropertyUpdates(newTemplate, bpmnFactory);

    var newPropertiesCount = Object.keys(newProperties).length;

    if (!newPropertiesCount) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: newProperties
      });
    } else {
      modeling.updateProperties(element, newProperties);
    }
  }

  function updateInOut(element, newTemplate, context) {

    var newInOut = createFlowableInOut(newTemplate, bpmnFactory),
        oldInOut;

    if (!newInOut) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { inout: newInOut }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldInOut = findExtensions(context, [ 'activiti:In', 'activiti:Out' ]);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newInOut,
        objectsToRemove: oldInOut
      });
    }
  }

  function updateExecutionListener(element, newTemplate, context) {

    var newExecutionListeners = createFlowableExecutionListeners(newTemplate, bpmnFactory),
        oldExecutionsListeners;

    if (!newExecutionListeners.length) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { executionListener: newExecutionListeners }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldExecutionsListeners = findExtensions(context, [ 'activiti:ExecutionListener' ]);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newExecutionListeners,
        objectsToRemove: oldExecutionsListeners
      });
    }
  }

  /**
   * Update / recreate a scoped element.
   *
   * @param {djs.model.Base} element the diagram parent element
   * @param {String} scopeName name of the scope, i.e. activiti:Connector
   * @param {Object} scopeDefinition
   */
  function updateScopeElements(element, scopeName, scopeDefinition) {

    var scopeElement = bpmnFactory.create(scopeName);

    // update activiti:inputOutput
    updateIoMappings(element, scopeDefinition, scopeElement);

    // update activiti:field
    updateFlowableField(element, scopeDefinition, scopeElement);

    // update activiti:properties
    updateFlowableProperties(element, scopeDefinition, scopeElement);

    // update other properties (bpmn:condition, activiti:async, ...)
    updateProperties(element, scopeDefinition, scopeElement);

    // update activiti:in and activiti:out
    updateInOut(element, scopeDefinition, scopeElement);

    // update activiti:executionListener
    updateExecutionListener(element, scopeDefinition, scopeElement);

    var extensionElements = getOrCreateExtensionElements(element);
    var oldScope = findExtension(extensionElements, scopeName);

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: extensionElements,
      propertyName: 'values',
      objectsToAdd: [ scopeElement ],
      objectsToRemove: oldScope ? [ oldScope ] : []
    });
  }

  /**
   * Compose an element template change action, updating all
   * necessary underlying properties.
   *
   * @param {Object} context
   * @param {Object} context.element
   * @param {Object} context.oldTemplate
   * @param {Object} context.newTemplate
   */
  this.preExecute = function(context) {

    var element = context.element,
        newTemplate = context.newTemplate;

    // update activiti:modelerTemplate attribute
    updateModelerTemplate(element, newTemplate);

    if (newTemplate) {

      // update activiti:inputOutput
      updateIoMappings(element, newTemplate);

      // update activiti:field
      updateFlowableField(element, newTemplate);

      // update activiti:properties
      updateFlowableProperties(element, newTemplate);

      // update other properties (bpmn:condition, activiti:async, ...)
      updateProperties(element, newTemplate);

      // update activiti:in and activiti:out
      updateInOut(element, newTemplate);

      // update activiti:executionListener
      updateExecutionListener(element, newTemplate);

      // loop on scopes properties
      forEach(newTemplate.scopes, function(scopeDefinition, scopeName) {
        updateScopeElements(element, scopeName, scopeDefinition);
      });

    }
  };
}

ChangeElementTemplateHandler.$inject = [ 'modeling', 'commandStack', 'bpmnFactory' ];

module.exports = ChangeElementTemplateHandler;



// helpers /////////////////////////////

function createBpmnPropertyUpdates(template, bpmnFactory) {

  var propertyUpdates = {};

  template.properties.forEach(function(p) {

    var binding = p.binding,
        bindingTarget = binding.name,
        propertyValue;

    if (binding.type === 'property') {

      if (bindingTarget === 'conditionExpression') {
        propertyValue = bpmnFactory.create('bpmn:FormalExpression', {
          body: p.value,
          language: binding.scriptFormat
        });
      } else {
        propertyValue = p.value;
      }

      // assigning activiti:async to true|false
      // assigning bpmn:conditionExpression to { $type: 'bpmn:FormalExpression', ... }
      propertyUpdates[bindingTarget] = propertyValue;

      // make sure we unset other "implementation types"
      // when applying a activiti:class template onto a preconfigured
      // activiti:delegateExpression element
      if (FLOWABLE_SERVICE_TASK_LIKE.indexOf(bindingTarget) !== -1) {
        FLOWABLE_SERVICE_TASK_LIKE.forEach(function(prop) {
          if (prop !== bindingTarget) {
            propertyUpdates[prop] = undefined;
          }
        });
      }
    }
  });

  return propertyUpdates;
}

function createFlowableFieldInjections(template, bpmnFactory) {
  var injections = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;
    if (bindingType === 'activiti:field') {
      injections.push(createFlowableFieldInjection(
        binding, p.value, bpmnFactory
      ));
    }
  });

  if (injections.length) {
    return injections;
  }
}

function createFlowableProperties(template, bpmnFactory) {

  var properties = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'activiti:property') {
      properties.push(createFlowableProperty(
        binding, p.value, bpmnFactory
      ));
    }
  });

  if (properties.length) {
    return bpmnFactory.create('activiti:Properties', {
      values: properties
    });
  }
}

function createInputOutputMappings(template, bpmnFactory) {

  var inputParameters = [],
      outputParameters = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'activiti:inputParameter') {
      inputParameters.push(createInputParameter(
        binding, p.value, bpmnFactory
      ));
    }

    if (bindingType === 'activiti:outputParameter') {
      outputParameters.push(createOutputParameter(
        binding, p.value, bpmnFactory
      ));
    }
  });

  // do we need to create new ioMappings (?)
  if (outputParameters.length || inputParameters.length) {
    return bpmnFactory.create('activiti:InputOutput', {
      inputParameters: inputParameters,
      outputParameters: outputParameters
    });
  }
}

function createFlowableInOut(template, bpmnFactory) {

  var inOuts = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'activiti:in') {
      inOuts.push(createFlowableIn(
        binding, p.value, bpmnFactory
      ));
    } else
    if (bindingType === 'activiti:out') {
      inOuts.push(createFlowableOut(
        binding, p.value, bpmnFactory
      ));
    } else
    if (bindingType === 'activiti:in:businessKey') {
      inOuts.push(createFlowableInWithBusinessKey(
        binding, p.value, bpmnFactory
      ));
    }
  });

  return inOuts;
}


function createFlowableExecutionListeners(template, bpmnFactory) {

  var executionListener = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'activiti:executionListener') {
      executionListener.push(createFlowableExecutionListenerScript(
        binding, p.value, bpmnFactory
      ));
    }
  });

  return executionListener;
}
