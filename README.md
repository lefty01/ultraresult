# ultraresult
Track times when runners enter and leave an aidstation during a (ultra) run/race.




# mongo db cmdline snippets

remove all documents from collection:
> db.aidstations.remove({})

update document within collection:
this would replace the document mathcing name and direction string, but the updated document only has new name and new directions. ALL OTHER FIELDS ARE GONE!
> db.aidstations.update( {name" : "Finish", directions : "Finish" }, { name : "FINISH", directions: "Sportplatz Altdorf" })
here we include all fields and change the ones we need
> db.aidstations.update( {"name" : "FINISH" }, { "lat" : "48.61571", "lng" : "8.99734", "legDistance" : "26.482", "totalDistance" : "163.283", "height" : "523.29", "pointType" : "Finish", "name" : "Finish", "directions" : "Sportplatz Altdorf" } )

Using updateOne and only specify fields to change via $set
> db.aidstations.update( {"name" : "Finish" }, { $set: { "name" : "FINISH" } } )

