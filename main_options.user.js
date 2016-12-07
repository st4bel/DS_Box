// ==UserScript==
// @name        DS_Box_options
// @namespace   de.die-staemme
// @version     0.1
// @description Meta-Optionen für alle scripte von diesem Autor
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       unsafeWindow
// @match       https://*.die-staemme.de/game.php?*screen=am_*
// @include     https://*.die-staemme.de/game.php?*screen=am_*
// @include     https://*.die-staemme.de/game.php?*screen=accountmanager*
// @copyright   2016+, the stabel, git
// @downloadURL -
// ==/UserScript==

/*
 * v0.1: erster Aufbau.
 * v0.2: tba
 */

var $ = typeof unsafeWindow != 'undefined' ? unsafeWindow.$ : window.$;
var _version = "0.1";
var _Anleitungslink = "#";

$(function(){
    var storage = localStorage;
    var storagePrefix="DS_Box_";
    //Speicherfunktionen
    function storageGet(key,defaultValue) {
        var value= storage.getItem(storagePrefix+key);
        return (value === undefined || value === null) ? defaultValue : value;
    }
    function storageSet(key,val) {
        storage.setItem(storagePrefix+key,val);
    }
    //storageSet("manager",storageGet("manager",'{0:{"scriptid":"att","runtime":"10","pausetime":"-1","groupid":"0"}}'));
    storageSet("manager",'{"0":{"scriptid":"att","runtime":"10","pausetime":"-1","groupid":"0"},"1":{"scriptid":"btt","runtime":"20","pausetime":"5","groupid":"0"},"2":{"scriptid":"ctt","runtime":"30","pausetime":"-1","groupid":"0"}}');
    storageSet("groups",storageGet("groups",'{"0":"alle"}'));

    init_UI();
    function init_UI(){
        //create UI_link
        var overview_menu = $("#overview_menu");
        var option_link = $("<a>")
        .attr("href","#")
        .text("DS_Box")
        .click(function(){
            toggleSettingsVisibility();
        });
        $("tr",overview_menu).prepend($("<td>").attr("style","min-width: 80px").append(option_link));

        //options popup
        var settingsDivVisible = false;
        var overlay=$("<div>")
        .css({
            "position":"fixed",
            "z-index":"99999",
            "top":"0",
            "left":"0",
            "right":"0",
            "bottom":"0",
            "background-color":"rgba(255,255,255,0.6)",
            "display":"none"
        })
        .appendTo($("body"));
        var settingsDiv=$("<div>")
        .css({
            "position":"fixed",
            "z-index":"100000",
            "left":"50px",
            "top":"50px",
            "width":"800px",
            "height":"400px",
            "background-color":"white",
            "border":"1px solid black",
            "border-radius":"5px",
            "display":"none",
            "padding":"10px"
        })
        .appendTo($("body"));
        function toggleSettingsVisibility() {
            if(settingsDivVisible) {
                overlay.hide();
                settingsDiv.hide();
            } else {
                overlay.show();
                settingsDiv.show();
            }

            settingsDivVisible=!settingsDivVisible;
        }

        //Head
        $("<h3>").text("DS_Box Meta Optionen, ").appendTo(settingsDiv).append($("<a>").attr("href","https://raw.githubusercontent.com/st4bel/DS_Box/master/main_options.user.js").text("Version "+_version));
        $("<span>").text("Legt die Reihenfolge fest, in der die Scripte ausgeführt werden sollen. Für eine genaue Anleitung bitte auf 'Anleitung' klicken.\n").appendTo(settingsDiv);

        //Settings
        var scriptmanager_table=$("<table>").appendTo(settingsDiv).attr("id","scriptmanager_table");
        init_scriptmanager_table();

        $("<button>").text("Gruppen aktualisieren").click(function(){
            readGroups();
        }).appendTo(settingsDiv);
        $("<br>").appendTo(settingsDiv);
        //Foot
        $("<button>").text("Schließen").click(function(){
            toggleSettingsVisibility();
        }).appendTo(settingsDiv);
        $("<button>").text("Anleitung").click(function(){
            window.open(_Anleitungslink, '_blank');
        }).appendTo(settingsDiv);
        //UI - functions
        function init_scriptmanager_table(){
            //header:
            $("<tr>").append($("<th>").text("script_id")).append($("<th>").text("max. runtime in min")).append($("<th>").text("pausetime")).append($("<th>").text("groupid")).append($("<th>").text("actions"))
            .appendTo(scriptmanager_table);
            //body
            var manager = JSON.parse(storageGet("manager"));
            for(var id in manager){
                addRowToScriptmanager(id);
            }
        }
        function addRowToScriptmanager(id){
            var manager = JSON.parse(storageGet("manager"))[id];
            var script_cell = $("<td>").text("ID: "+manager.scriptid);
            var runtime_cell = $("<td>")
            .append(
                $("<input>")
                .attr("type","text")
                .attr("name",id)
                .val(manager.runtime)
                .on("input",function(){
                    var m =  JSON.parse(storageGet("manager"));
                    m[$(this).attr("name")].runtime = $(this).val();
                    storageSet("manager",JSON.stringify(m));
                    console.log("manager changed to: "+storageGet("manager"));
                })
            );
            var pausetime_cell = $("<td>")
            .append(
                $("<input>")
                .attr("type","text")
                .attr("name",id)
                .val(manager.pausetime)
                .on("input",function(){
                    var m =  JSON.parse(storageGet("manager"));
                    m[$(this).attr("name")].pausetime = $(this).val();
                    storageSet("manager",JSON.stringify(m));
                    console.log("manager changed to: "+storageGet("manager"));
                })
            );
            var groupselect_cell = $("<td>")
            .append(
                $("<select>")
                .attr("name",id)
                .change(function(){
                    var m =  JSON.parse(storageGet("manager"));
                    m[$(this).attr("name")].groupid = $("option:selected",$(this)).val();
                    storageSet("manager",JSON.stringify(m));
                    console.log("manager changed to: "+storageGet("manager"));
                })
            );
            var groups = JSON.parse(storageGet("groups"));
            for(var gid in groups){
                $("<option>")
                .text(groups[gid])
                .attr("value",gid)
                .appendTo($("select",groupselect_cell));
            }
            $("option[value="+manager.groupid+"]",groupselect_cell).prop("selected",true);
            var other_cell = $("<td>")
            .append(
                $("<span>").text("< ").css("cursor","pointer").attr("name",id).hover(function (){$(this).css("text-decoration", "underline");},function(){$(this).css("text-decoration", "none");})
                .click(function(){
                    var currentrow_id = parseInt($(this).attr("name"));
                    moveManagerItem(-1,currentrow_id);
                    scriptmanager_table.empty();
                    init_scriptmanager_table();
                }))
            .append(
                $("<span>").text(">").css("cursor","pointer").attr("name",id).hover(function (){$(this).css("text-decoration", "underline");},function(){$(this).css("text-decoration", "none");})
                .click(function(){
                    var currentrow_id = parseInt($(this).attr("name"));
                    moveManagerItem(1,currentrow_id);
                    scriptmanager_table.empty();
                    init_scriptmanager_table();
                })
            );

            //appending everything
            $("<tr>").attr("name",id)
            .append(script_cell).append(runtime_cell).append(pausetime_cell).append(groupselect_cell).append(other_cell)
            .appendTo(scriptmanager_table);
        }
    }
    function moveManagerItem(asc_desc,id){
        var manager = JSON.parse(storageGet("manager"));
        if(id+asc_desc>=0&&id+asc_desc<=Object.keys(manager).length){
            console.log("z: "+storageGet("manager"));
            id = parseInt(id);
            current  = manager[""+id];
            manager[""+id] = manager[""+(id+asc_desc)];
            manager[""+(id+asc_desc)] = current;
            console.log("a: "+storageGet("manager"));
            storageSet("manager",JSON.stringify(manager));
            console.log("b: "+storageGet("manager"));
        }else{
            alert("Unable to move "+manager[id].scriptid+" in that direction! It might be first or last.");
        }
    }
    function readGroups(){
        var groups = {};
        $("a.group-menu-item").each(function(){
            groups[getGroupIdOutOfElement($(this))] = $(this).text().substring(1,$(this).text().length-1);
        });
        //current group:
        $("strong.group-menu-item").each(function(){
            groups[getGroupIdOutOfElement($("#village_switch_right"))] = $(this).text().substring(1,$(this).text().length-2);
        });
        function getGroupIdOutOfElement(handle){
            var link = handle.attr("href");
            var pos1 = link.indexOf("group=")+6;
            var pos2 = link.indexOf("&",pos1)!=-1?link.indexOf("&",pos1) : link.length;
            return link.substring(pos1,pos2);
        }

        storageSet("groups",JSON.stringify(groups));
        console.log("Set groups to: "+storageGet("groups"));
    }
});
