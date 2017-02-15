class FFMaterialBuddy {
    constructor() {
        this.activeFilters = [];
        this.itemLocationMap = [];
        this.searchList = [];
        this.fullList = [];
        this.main = $("#MainTextArea");
        this.selector = $("#LocationSelector");
        this.selectionBar = $("#SelectionBar");
        this.options = $("#Options");
        this.populateSelector();
        this.selector.keypress((e) => {
            if (e.keyCode == 13) {
                (this.selector).autocomplete('close');
                this.update(e, null);
            }
        });
        $(".addList").click((e) => {
            var selection = ($("#LocationSelector")[0]).value.toLowerCase();
            if (this.fullList.findIndex(item => item.toLowerCase() == selection) != -1
                && this.searchList.indexOf(selection) == -1) {
                this.searchList.push(selection);
                this.updateSearchList();
                this.update(null, null);
            }
        });
        $("#OptionSelector").click(element => this.options.css("opacity") == "0" ? this.options.css("opacity", 1) : this.options.css("opacity", 0));
        $("#ShowDescription").click(element => this.showDescriptions());
        $("#HideDescription").click(element => this.hideDescriptions());
        $("#BotanyFilter").click(element => this.updateFilters(element));
        $("#MiningFilter").click(element => this.updateFilters(element));
        $("#EnemyFilter").click(element => this.updateFilters(element));
    }
    populateSelector() {
        this.fullList = Locations.map.filter(map => map.map != "").map(map => map.map);
        (this.selector).autocomplete({
            minLength: 1,
            source: this.fullList,
            select: (e, ui) => this.update(e, ui),
            appendTo: "#AutoComplete",
            position: {
                "my": "left top",
                "at": "left bottom",
                "of": this.selectionBar
            }
        });
    }
    updateSearchList() {
        var listElement = $("#SearchList");
        listElement.empty();
        for (var item of this.searchList) {
            listElement.append($("<div/>", { class: "listElement" })
                .append($("<span/>", { class: "listElementText", text: item }))
                .append($("<span/>", { class: "listElementClose fa fa-remove", "data-item": item })));
        }
        $(".listElementClose").click((e) => this.removeFromList(e));
    }
    removeFromList(event) {
        var item = $(event.target).data("item");
        var i = this.searchList.indexOf(item);
        this.searchList.splice(i, 1);
        this.updateSearchList();
        this.update(null, null);
    }
    update(event, ui) {
        var origEvent = event;
        while (origEvent && origEvent.originalEvent !== undefined)
            origEvent = origEvent.originalEvent;
        var selected = "";
        if (origEvent && origEvent.type == "click") {
            selected = ui.item.value.toLowerCase();
        }
        else {
            selected = ($("#LocationSelector")[0]).value.toLowerCase();
        }
        if (selected == "")
            return;
        var index = Locations.map.findIndex((loc) => loc.map.toLowerCase() == selected);
        if (index == -1)
            return;
        this.main.empty();
        var ids = new Set(Locations.map[index].ids);
        for (var item of this.searchList) {
            var searchindex = Locations.map.findIndex((loc) => loc.map.toLowerCase() == item);
            $.each(Locations.map[searchindex].ids, (key, value) => {
                ids.add(value);
            });
        }
        var itemsRaw = Final.results.filter((item) => ids.has(item.id));
        var prettyItems = itemsRaw.map(item => this.formHTML(selected, item)).reduce((total, add) => total.append(add), this.main);
        $(".expandedBlock").css({ height: 0 });
        $(".enemyButton.enabled").text("Enemy +");
        $(".miningButton.enabled").text("Mining +");
        $(".botanyButton.enabled").text("Botany +");
        $(".enemyButton.enabled").click(element => this.expandClicked(element, "Enemy", "enemies"));
        $(".miningButton.enabled").click(element => this.expandClicked(element, "Mining", "gathering"));
        $(".botanyButton.enabled").click(element => this.expandClicked(element, "Botany", "gathering"));
    }
    showDescriptions() {
        $("#HideDescription").addClass("disabled");
        $("#ShowDescription").removeClass("disabled");
        $(".text p").css({ height: "100%", opacity: 1 });
    }
    hideDescriptions() {
        $("#ShowDescription").addClass("disabled");
        $("#HideDescription").removeClass("disabled");
        $(".text p").css({ height: "0", opacity: 0 });
    }
    updateFilters(element) {
        var clicked = $(element.target);
        if (clicked.attr('id') == "BotanyFilter") {
            if (this.activeFilters.indexOf("botany") == -1) {
                this.activeFilters.push("botany");
                clicked.addClass("disabled");
            }
            else {
                clicked.removeClass("disabled");
                this.activeFilters = this.activeFilters.filter(item => item != "botany");
            }
        }
        if (clicked.attr('id') == "MiningFilter") {
            if (this.activeFilters.indexOf("mining") == -1) {
                this.activeFilters.push("mining");
                clicked.addClass("disabled");
            }
            else {
                clicked.removeClass("disabled");
                this.activeFilters = this.activeFilters.filter(item => item != "mining");
            }
        }
        if (clicked.attr('id') == "EnemyFilter") {
            if (this.activeFilters.indexOf("enemy") == -1) {
                this.activeFilters.push("enemy");
                clicked.addClass("disabled");
            }
            else {
                clicked.removeClass("disabled");
                this.activeFilters = this.activeFilters.filter(item => item != "enemy");
            }
        }
        $(".itemBlock").each((index, item) => this.determineHiding($(item)));
    }
    determineHiding(item) {
        var mining = item.find(".miningButton");
        var botany = item.find(".botanyButton");
        var enemy = item.find(".enemyButton");
        if (!(this.activeFilters.indexOf("mining") != -1 && mining.hasClass("enabled"))
            && !(this.activeFilters.indexOf("botany") != -1 && botany.hasClass("enabled"))
            && !(this.activeFilters.indexOf("enemy") != -1 && enemy.hasClass("enabled"))) {
            item.removeClass("disabled");
            item.animate({ opacity: 1 });
        }
        else {
            item.animate({ opacity: 0 }, 500, () => setTimeout(() => item.addClass("disabled"), 300));
        }
    }
    expandClicked(element, type, classname) {
        var clicked = $(element.target);
        var expandBlock = clicked.closest(".itemBlock").children(".expandedBlock." + classname);
        if (expandBlock.hasClass("open")) {
            expandBlock.animate({ height: 0 }, 300, () => {
                expandBlock.animate({ opacity: 0 }, 50);
                clicked.text(type + " +");
                expandBlock.removeClass("open");
            });
        }
        else {
            expandBlock.addClass("open");
            expandBlock.animate({ opacity: 1 }, 50, () => expandBlock.animate({ height: expandBlock.get(0).scrollHeight }, 400, () => {
                clicked.text(type + " -");
                expandBlock.children("." + classname + "block").animate({ opacity: 1 });
                expandBlock.css({ height: "auto" });
            }));
        }
    }
    formHTML(selected, item) {
        var zones = [];
        var htmlblock = $("<div/>", { class: 'itemBlock', id: item.id })
            .append($("<div/>", { class: 'unexpandedBlock secondaryColor bordered' })
            .append($("<span/>", { class: 'infoArea' })
            .append($("<div/>", { class: 'icon' })
            .append($("<img/>", { src: item.icon })))
            .append($("<div/>", { class: 'text' })
            .append($("<h2/>", { text: item.name, class: "itemName" }))
            .append($("<p/>", { text: item.description }))
            .append($("<div/>", { class: "expandButtons" })
            .append($("<span/>", { text: "Mining", class: "miningButton " + (item.gathering != "" && (item.gathering[0].type == "Mining" || item.gathering[0].type == "Quarrying") ? "enabled" : "disabled") }))
            .append($("<span/>", { text: "Botany", class: "botanyButton " + (item.gathering != "" && (item.gathering[0].type == "Harvesting" || item.gathering[0].type == "Logging") ? "enabled" : "disabled") }))
            .append($("<span/>", { text: "Enemy", class: "enemyButton " + (item.enemies != "" ? "enabled" : "disabled") }))))))
            .append($("<div/>", { class: 'expandedBlock enemies secondaryColor bordered' }))
            .append($("<div/>", { class: 'expandedBlock gathering secondaryColor bordered' }));
        if (item.enemies != "") {
            var enemiesDiv = htmlblock.find(".enemies");
            for (var enemy of item.enemies) {
                if (enemy.map && (enemy.map.mapname.toLowerCase() == selected || this.searchList.indexOf(enemy.map.mapname.toLowerCase()) != -1)) {
                    if (zones.indexOf(enemy.map.mapname.toLowerCase()) == -1)
                        zones.push(enemy.map.mapname.toLowerCase());
                    enemiesDiv.append($("<div/>", { class: 'enemiesblock expand' })
                        .append($("<span/>", { class: "enemyName", text: enemy.name }))
                        .append($("<span/>", { class: "enemyLevel", text: (enemy.maxlevel == enemy.minlevel)
                            ? "Level: " + enemy.minlevel
                            : "Level Range: " + enemy.minlevel + " - " + enemy.maxlevel })));
                }
            }
        }
        if (item.gathering != "") {
            var mining = (item.gathering[0].type == "Mining" || item.gathering[0].type == "Quarrying");
            var gatheringDiv = htmlblock.find(".gathering");
            var gathering = item.gathering[0];
            for (var node of gathering.node) {
                if (node.mapname && (node.mapname.toLowerCase() == selected || this.searchList.indexOf(node.mapname.toLowerCase()) != -1)) {
                    if (zones.indexOf(node.mapname.toLowerCase()) == -1)
                        zones.push(node.mapname.toLowerCase());
                    var stars = Array.from(Array(gathering.stars).keys()).reduce((total, current) => total + "★", "");
                    var block = $("<div/>", { class: 'gatheringblock expand' }).appendTo(gatheringDiv);
                    block.append($("<span/>", { class: "nodeLevel", text: "Node: " + node.level }))
                        .append($("<span/>", { class: "gatheringLevel", text: "Gathering: " + gathering.glevel + stars }));
                    if (gathering.placename != "") {
                        block.append($("<span/>", { class: "gatherLocation", text: "Location: " + gathering.placename }));
                    }
                }
            }
        }
        if (this.searchList.length > 0 && zones.length > 0) {
            htmlblock.find(".itemName").after($("<h2/>", { class: "zones", text: "Zones: " + zones.join(", ") }));
        }
        return htmlblock;
    }
}
new FFMaterialBuddy();
