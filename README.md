# ultraresult

[![Build Status](https://travis-ci.org/lefty01/ultraresult.svg?branch=leaderboard)](https://travis-ci.org/lefty01/ultraresult)

[![Join the chat at https://gitter.im/lefty01/ultraresult](https://badges.gitter.im/lefty01/ultraresult.svg)](https://gitter.im/lefty01/ultraresult?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Track times when runners enter and leave an aidstation during a (ultra) run/race.



# mongo db cmdline snippets

remove all documents from collection:
> db.aidstations.remove({})

remove/drop collection:
> db.aidstations.drop()

update document within collection:
this would replace the document mathcing name and direction string, but the updated document only has new name and new directions. ALL OTHER FIELDS ARE GONE!
> db.aidstations.update( {name" : "Finish", directions : "Finish" }, { name : "FINISH", directions: "Sportplatz Altdorf" })
here we include all fields and change the ones we need
> db.aidstations.update( {"name" : "FINISH" }, { "lat" : "48.61571", "lng" : "8.99734", "legDistance" : "26.482", "totalDistance" : "163.283", "height" : "523.29", "pointType" : "Finish", "name" : "Finish", "directions" : "Sportplatz Altdorf" } )

Using updateOne and only specify fields to change via $set
> db.aidstations.update( {"name" : "Finish" }, { $set: { "name" : "FINISH" } } )


Remove the field (eg. the aidstations array field)  from a document with $unset:
> db.runnerlist.update( {"startnum" : "1" }, { $unset : { "aidstations" : "" } }  )

push an element onto the aidstations array: NOTE: always adds new element
here this only makes sense if there's no such array item available 
> db.runnerlist.update( {"startnum" : "1" }, { $push : { "aidstations" : { name : "VP1", "intime" : "16:00", "intime_valid" : true } } } )


find runner by startnum and aidstation name:
> db.runnerlist.find( {"startnum" : "1", "aidstations.name" : "VP2" }  )
> db.runnerlist.find( {"startnum" : "1", "aidstations.name" : "START" }  )

-> if nothing returned, then can push ...

update/add aidstation times for runner, need to modify an existing element from the aidstation array
eg. aidstations.name : VP1



different approach, without array 
> db.runnerlist.update( {"startnum" : "1" }, { $set : { "results.START.intime_valid" : "false", "results.START.outtime_valid" : "true", "results.START.outtime":"16:30"} } )

