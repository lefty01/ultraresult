# ultraresult

[![Build Status](https://travis-ci.org/lefty01/ultraresult.svg?branch=leaderboard)](https://travis-ci.org/lefty01/ultraresult)

[![Join the chat at https://gitter.im/lefty01/ultraresult](https://badges.gitter.im/lefty01/ultraresult.svg)](https://gitter.im/lefty01/ultraresult?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


Track times when runners enter and leave an aidstation/checkpoint during a (ultra) run/race.
This nodejs/express/mongodb based app offers webpages for each aidstation showing the runner list and two input fields for the in and out time.
It will also feature a "drop out" checkbox in case a runner decides to not finish the run.

Furthermore a overall result webpage with the current overall standings (live result) is offered.
This result page can be sorted and will show some estimates when next aidstation/checkpoint and finish line might be reached based on the
pace achieved during the previous stages of the race.
Race prediction can take course elevation into account if that data is provided.


# Config
Now featuring a config file which currently holds only mongo database name and port.
Format is json, for example create a file called 'ultraresult.conf':
```json
{
    "database": {
        "name" : "ultra_2018",
	"host" : "localhost",
	"port" : 3333
    }
}
```

# Implementation
## results webpage
Shows results aka aidstation in/out times as they are entered.
In addition time spent at each aid station is calculated and displayed. Also total pause time is shown.
And following times and pace info is shown as well:
* T1: hh:mm time between this aid in and last aid out
* T2: hh:mm time between this aid in and start (aka current total time)
* P1: avg pace for last segment (min:ss per km between this aid in and last out)
* P2: total avg pace from start until this aid in
T1(hh:mm): Zeit zwischen VPn-1Tout und VPnTin ,   T2(hh:mm): Zeit zwischen Start und VPnTin ,   P1(mm:ss/km): Ø Pace zwischen VPn-1Tout und VPnTin ,   P2(mm:ss/km): Ø Pace zwischen Start und VPnTin

Result table is sorted by total time (runners having more aid station out times are higher ranked of course, even though total time would be higher).
The related javascript is in results.js


## aidstation input page
each aidstation has its own page where a list of runners is shown.
After page load/reload for each runner the current time is displayed in the in and out input fields.
If there has been a time entered (and saved) for this runner previously then this time is shown instead, and the field gets a red background and is locked.
You can click "Edit" to change a already saved (locked) time. After "Edit" click "Save" again. If you click "Edit" background color change to green. On "Save" background becomes red.
The related javascript code is in aidstation.js




# TODOs
* language (don't mix german english, switch language button)


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

