class FFMaterialBuddy {
    constructor() {
        this.itemLocationMap = [];
        this.sources = [
            "gathering",
            "enemy"
        ];
        this.promises = [];
        this.main = $("#MainTextArea");
        this.selector = $("#LocationSelector");
        this.populateSelector();
        this.selector.keypress((e) => {
            if (e.keyCode == 13) {
                (this.selector).autocomplete('close');
                this.update();
            }
        });
    }
    populateSelector() {
        (this.selector).autocomplete({
            minLength: 1,
            source: Locations.map.filter(map => map.map != "").map(map => map.map),
            select: () => this.update(),
            appendTo: "#AutoComplete"
        });
    }
    update() {
        var selected = ($("#LocationSelector")[0]).value.toLowerCase();
        if (selected == "")
            return;
        var index = Locations.map.findIndex((loc) => loc.map.toLowerCase() == selected);
        if (index == -1)
            return;
        var ids = Locations.map[index].ids;
        var itemsRaw = Final.results.filter((item) => ids.indexOf(item.id) != -1);
        this.main.empty();
        var prettyItems = itemsRaw.map(item => this.formHTML(selected, item)).reduce((total, add) => total.append(add), this.main);
        $(".expandedBlock").css({ height: 0 });
        var enabled = $(".enemyButton.enabled");
        enabled.click(element => {
            var clicked = $(element.target);
            var expandBlock = clicked.closest(".itemBlock").children(".expandedBlock.enemies");
            if (expandBlock.hasClass("open")) {
                expandBlock.animate({ height: 0 }, 300, () => {
                    expandBlock.animate({ opacity: 0 }, 50);
                    clicked.text("Enemy +");
                    expandBlock.removeClass("open");
                });
            }
            else {
                expandBlock.addClass("open");
                expandBlock.animate({ opacity: 1 }, 50, () => expandBlock.animate({ height: expandBlock.get(0).scrollHeight }, 400, () => {
                    clicked.text("Enemy -");
                    expandBlock.children(".enemyblock").animate({ opacity: 1 });
                }));
            }
        });
    }
    formHTML(selected, item) {
        var htmlblock = $("<div/>", { class: 'itemBlock', id: item.id })
            .append($("<div/>", { class: 'unexpandedBlock' })
            .append($("<span/>", { class: 'infoArea' })
            .append($("<div/>", { class: 'icon' })
            .append($("<img/>", { src: item.icon })))
            .append($("<div/>", { class: 'text' })
            .append($("<h2/>", { text: item.name }))
            .append($("<p/>", { text: item.description }))
            .append($("<div/>", { class: "expandButtons" })
            .append($("<span/>", { text: "Mining", class: "miningButton " + (item.gathering != "" && (item.gathering[0].type == "Mining" || item.gathering[0].type == "Quarrying") ? "enabled" : "disabled") }))
            .append($("<span/>", { text: "Botany", class: "gatheringButton " + (item.gathering != "" && (item.gathering[0].type == "Harvesting" || item.gathering[0].type == "Logging") ? "enabled" : "disabled") }))
            .append($("<span/>", { text: "Enemy +", class: "enemyButton " + (item.enemies != "" ? "enabled" : "disabled") }))))))
            .append($("<div/>", { class: 'expandedBlock enemies' }))
            .append($("<div/>", { class: 'expandedBlock gathering' }));
        if (item.enemies != "") {
            var enemiesDiv = htmlblock.find(".enemies");
            for (var enemy of item.enemies) {
                if (enemy.map && enemy.map.mapname.toLowerCase() == selected) {
                    enemiesDiv.append($("<div/>", { class: 'enemyblock' })
                        .append($("<span/>", { class: "enemyName", text: enemy.name }))
                        .append($("<span/>", { class: "enemyLevel", text: (enemy.maxlevel == enemy.minlevel)
                            ? "Level: " + enemy.minlevel
                            : "Level Range: " + enemy.minlevel + " - " + enemy.maxlevel })));
                }
            }
        }
        return htmlblock;
    }
}
new FFMaterialBuddy();
