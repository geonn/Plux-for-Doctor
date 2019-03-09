var args = arguments[0] || {};

var search_bar = (OS_IOS)?Titanium.UI.createSearchBar({
    hintText: args.title+" Search"
}):Ti.UI.Android.createSearchView({
    hintText: args.title+" Search"
});
var items = [];
for (var i=0; i < args.listing.length; i++) {
    if(OS_IOS){
        var row = $.UI.create("TableViewRow", {title: args.listing[i].value});
        var view = $.UI.create("View", {classes:['wfill','hsize','padding'], height: 20});
        row.add(view);
        items.push(row);
    }else{
        items.push({title: args.listing[i].value, color: "#000000"});
    }
};
var tableview = Titanium.UI.createTableView({
    data: items,
    layout: "vertiacl",
    search: search_bar,
    backgroundColor: "#ffffff",
    searchAsChild: true,
    zIndex:100
});

tableview.addEventListener("click", function(e){
    args.callback(args.listing[e.index]);
    $.win.close();
    return;
    if(typeof tf.source == "undefined"){
        tf.value = diagCategory[i].code+" - "+diagCategory[i].desc;
        tf.text = diagCategory[i].code+" - "+diagCategory[i].desc;
        tf.name = diagCategory[e.index].code;
        tf.color = "#000000";
        tf.position = e.index;
    }else{
        tf.source.value = diagCategory[e.index];
        tf.source.text = diagCategory[e.index];
        tf.source.name = diagCategory[e.index];
        tf.source.color = "#000000";
        selectedDiag1 = e.index;
    }
    $.win.remove(tableview);
});
$.win.add(tableview);
