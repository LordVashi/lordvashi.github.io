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
        this.selector.change(() => this.update());
    }
    populateSelector() {
        for (var map of Locations.map) {
            this.selector.append($('<option/>', {
                text: (map).map
            }));
        }
    }
    update() {
        var selected = $("#LocationSelector option:selected").text();
        var index = Locations.map.findIndex((loc) => loc.map == selected);
        var ids = Locations.map[index].ids;
        var itemsRaw = Final.results.filter((item) => ids.indexOf(item.id) != -1);
        var prettyItems = itemsRaw.map(item => this.prettyText(item)).reduce((total, add) => total.concat(add), "");
        this.main.text(prettyItems);
        this.textAreaAdjust();
    }
    prettyText(item) {
        return "Name: " + item.name + "\nDescription: " + item.description.replace("<br>", " ")
            + "\nSource Types: " + ($.isArray(item.sourceType) ? item.sourceType[0] + ", " + item.sourceType[1] : item.sourceType)
            + (item.enemies != "" ? "\nEnemies: " + item.enemies.reduce((total, add) => total + ", " + add.name, "").substring(1) : "")
            + "\n\n";
    }
    textAreaAdjust() {
        this.main.height("1px");
        this.main.height((25 + this.main[0].scrollHeight) + "px");
    }
}
new FFMaterialBuddy();
