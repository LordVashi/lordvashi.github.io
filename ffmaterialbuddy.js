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
            if ((map).map != "") {
                this.selector.append($('<option/>', {
                    text: (map).map
                }));
            }
        }
    }
    update() {
        var selected = $("#LocationSelector option:selected").text();
        var index = Locations.map.findIndex((loc) => loc.map == selected);
        var ids = Locations.map[index].ids;
        var itemsRaw = Final.results.filter((item) => ids.indexOf(item.id) != -1);
        this.main.empty();
        var prettyItems = itemsRaw.map(item => this.formHTML(item)).reduce((total, add) => total.append(add), this.main);
    }
    formHTML(item) {
        return $("<div/>", { class: 'itemBlock', id: item.id })
            .append($("<div/>", { class: 'unexpandedBlock' })
            .append($("<span/>", { class: 'infoArea' })
            .append($("<div/>", { class: 'icon' })
            .append($("<img/>", { src: item.icon })))
            .append($("<div/>", { class: 'text' })
            .append($("<h2/>", { text: item.name }))
            .append($("<p/>", { text: item.description }))
            .append($("<div/>", { class: "expandButtons" })
            .append($("<span/>", { text: "Mining", class: item.gathering != "" && (item.gathering[0].type == "Mining" || item.gathering[0].type == "Quarrying") ? "enabled" : "disabled" }))
            .append($("<span/>", { text: "Botany", class: item.gathering != "" && (item.gathering[0].type == "Harvesting" || item.gathering[0].type == "Logging") ? "enabled" : "disabled" }))
            .append($("<span/>", { text: "Enemy", class: item.enemies != "" ? "enabled" : "disabled" }))))));
    }
}
new FFMaterialBuddy();
