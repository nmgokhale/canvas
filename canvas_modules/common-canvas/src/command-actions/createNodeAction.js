/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
import Action from "../command-stack/action.js";

export default class CreateNodeAction extends Action {
	constructor(data, objectModel) {
		super(data);
		this.data = data;
		this.objectModel = objectModel;
		this.apiPipeline = this.objectModel.getAPIPipeline(data.pipelineId);
		this.newNode = this.apiPipeline.createNode(data);
	}

	// Return augmented command object which will be passed to the
	// client app.
	getData() {
		this.data.newNode = this.newNode;
		return this.data;
	}

	// Standard methods
	do() {
		this.apiPipeline.addNode(this.newNode);
	}

	undo() {
		this.apiPipeline.deleteNode(this.newNode.id);
	}

	redo() {
		this.apiPipeline.addNode(this.newNode);
	}
}
