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
        items.push({properties: {title: args.listing[i].value, searchableText: args.listing[i].value, color: "#000000"}});
    }
};

var listSection = Titanium.UI.createListSection({items: items});

var listView = Titanium.UI.createListView({
    sections: [listSection],
    layout: "vertiacl",
    searchView: search_bar,
    backgroundColor: "#ffffff",
    zIndex:100
});

listView.addEventListener("itemclick", function(e){
  console.log(args.listing[e.itemIndex]);
    args.callback(args.listing[e.itemIndex]);
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
    $.win.remove(listView);
});
$.win.add(listView);
