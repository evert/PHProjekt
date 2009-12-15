/**
 * This software is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License version 2.1 as published by the Free Software Foundation
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * @copyright  Copyright (c) 2008 Mayflower GmbH (http://www.mayflower.de)
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    $Id$
 * @author     Gustavo Solt <solt@mayflower.de>
 * @package    PHProjekt
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 */

dojo.provide("phpr.Project.Main");

dojo.declare("phpr.Project.Main", phpr.Default.Main, {
    constructor:function() {
        this.module = 'Project';
        this.loadFunctions(this.module);

        dojo.subscribe("Project.basicData", this, "basicData");

        this.gridWidget          = phpr.Project.Grid;
        this.formWidget          = phpr.Project.Form;
        this.formBasicDataWidget = phpr.Project.FormBasicData;
    },

    loadResult:function(id, module, projectId) {
        this.cleanPage();
        phpr.currentProjectId = id;
        phpr.Tree.fadeIn();
        this.setUrlHash(module, null, ["basicData"]);
    },

    basicData:function() {
        phpr.module = this.module;
        this.cleanPage();
        this.render(["phpr.Project.template", "BasicData.html"], dojo.byId('centerMainContent'));
        this.setSubmoduleNavigation('BasicData');
        this.hideSuggest();
        this.setSearchForm();
        phpr.Tree.fadeIn();
        phpr.Tree.loadTree();
        if (!dojo.byId('detailsBox')) {
            this.reload();
        }
        this.form = new this.formBasicDataWidget(this, phpr.currentProjectId, phpr.module);
    },

    updateCacheData:function() {
        phpr.Tree.updateData();
        if (this.grid) {
            this.grid.updateData();
        }
        if (this.form) {
            this.form.updateData();
        }
        phpr.DataStore.deleteAllCache();
    },

    processActionFromUrlHash:function(data) {
        if (data[0] == 'basicData') {
            this.basicData();
        } else {
            this.reload();
        }
    }
});
