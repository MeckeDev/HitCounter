const fs = require('fs').promises
const settings = require("./settings.json")
var splits = require("./splits.json")
const { dialog } = require('electron')

async function savefile(file, data){
    await fs.writeFile(file, data, (err) => {
        if (err) {
            throw err;
        }
    });
}

async function load_splits(name){

    if(splits["active_profile"][0] != name){
        splits["active_profile"] = [name, 0, 0]
    }

    var content = ""
    var values = splits[name]

    if(settings["edit"]){

        document.getElementById("split_table").innerHTML = `
        
        <table class="table text-center table-dark table-striped">
            <tbody id="splits">
                
            </tbody>
        </table>
        `

        for (var x in values){

            var y = Object.keys(values).indexOf(x)
    
            content += `
            <tr>
                <td><input type="text" id="rename" onchange="renameKey('${x}', this.value)" placeholder="${x}"></td>
                <!--<td><button class="btn btn-info w-100" onclick="up(${y})" type="button">↑</button></td>
                <td><button class="btn btn-info w-100" onclick="down(${y})" type="button">↓</button></td>-->

                <td><button class="btn btn-danger w-100" onclick="remove_split('${x}')" type="button">-</button></td>
                
            </tr>`
        }

        content += `
        <tr><td colspan="4">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" id="new_split" placeholder="Split-Name">
                    <button class="btn btn-success" onclick="new_split()" type="button">Add Split</button>
                </div>
            </td>
        </tr>
        `

        document.getElementById("dropdownMenuButton1").innerText = splits["active_profile"][0]

    }
    else{

        document.getElementById("split_table").innerHTML = `
        
        <table class="table text-center font-weight-bold">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Curr</th>
                    <th>Diff</th>
                    <th>PB</th>
                </tr>
            </thead>
            <tbody id="splits">
                
            </tbody>
        </table>
        `

        for (var x in values){

            var curr = values[x]["current"]
            var pb = values[x]["pb"]
            var best = values[x]["best"]
            diff = curr - pb
            if(diff >= 0){
                pre = "+"+diff
            }

            if(diff <= 0){
                var color = "text-success"
                var pre = ""
            }
            else{
                var color = "text-danger"
                var pre = "+"
            }

            if(x == Object.keys( splits[splits["active_profile"][0]] )[splits["active_profile"][2]]){
                content += `
                <tr class="table-success ${color}">
                <td>${x}</td>
                <td>${curr}</td>
                <td>${pre}${diff}</td>
                <td>${pb} (${best})</td>
                </tr>`
            }
            else{
                content += `
                <tr class="${color}">
                <td>${x}</td>
                <td>${curr}</td>
                <td>${pre}${diff}</td>
                <td>${pb} (${best})</td>
                </tr>`

            }
    
        }

        var sum = 0
        var sum_pb = 0
        var sum_best = 0
        for(var x in splits[splits["active_profile"][0]] ){
            sum += splits[splits["active_profile"][0]][x]["current"]
            sum_pb += splits[splits["active_profile"][0]][x]["pb"]
            sum_best += splits[splits["active_profile"][0]][x]["best"]
        }

        
        sum_diff = sum - sum_pb
        if(sum_diff >= 0){
            pre = "+"+sum_diff
        }

        content += `
            <tr class="bg-dark text-light">
            <td>Summary</td>
            <td>${sum}</td>
            <td>${sum_diff}</td>
            <td>${sum_pb} (${sum_best})</td>
            </tr>`
    
        document.getElementById("dropdownMenuButton1").innerText = splits["active_profile"][0]
    
        const data = JSON.stringify(splits, null, 8);
        await savefile('./splits.json', data)

    }
    

    document.getElementById("splits").innerHTML = content

}

async function load_profiles(){

    var content = ""

    for (var x in splits){
        if(x != "active_profile"){
            content += `<li><a class="dropdown-item " onclick='load_splits("${x}")'>${x}</a></li>`
        }
    }
    
    if(!settings["edit"]){
        document.getElementById("edit").innerHTML = `<button class="btn btn-success w-100" onclick="editmode()" type="button">Edit Splits</button>`
    }
    else{
        document.getElementById("edit").innerHTML = `<button class="btn btn-danger w-100" onclick="editmode()" type="button">End Editmode</button>`
    }

    await load_splits(splits["active_profile"][0])
    
    document.getElementById("profiles").innerHTML = content

}

async function reset_splits(save=false){

    if(save){

        for(var x in splits[splits["active_profile"][0]] ){
            splits[splits["active_profile"][0]][x]["pb"] = splits[splits["active_profile"][0]][x]["current"]
            if(splits[splits["active_profile"][0]][x]["current"] < splits[splits["active_profile"][0]][x]["best"]){
                splits[splits["active_profile"][0]][x]["best"] = splits[splits["active_profile"][0]][x]["current"]
            }
        }

    }

    for(var x in splits[splits["active_profile"][0]] ){
        splits[splits["active_profile"][0]][x]["current"] = 0
        // splits[splits["active_profile"][0]][x]["pb"]
        // splits[splits["active_profile"][0]][x]["best"]
    }

    const data = JSON.stringify(splits, null, 8);
    await savefile('./splits.json', data)

    location.reload()

}

async function add_profile(){
    
    const name = document.getElementById("new_profile").value
    
    splits[name] = {}

    const data = JSON.stringify(splits, null, 8);
    await savefile('./splits.json', data)

    load_profiles();

}

async function set_split(){

    var splits = require("./splits.json")

    if( splits["active_profile"][2] >= ( Object.keys( splits[splits["active_profile"][0]] ).length-1 ) ){


        var answer = window.confirm("Save data?");
        if (answer) {
            splits["active_profile"][2] = 0
            reset_splits(true)

        }
        else {
            splits["active_profile"][2] = 0
            reset_splits()           
        }

    }
    else{
        var splits = require("./splits.json")

        splits["active_profile"][2] += 1

    }

    
    const data = JSON.stringify(splits, null, 8);
    await savefile("./splits.json", data)

    location.reload()
}

async function editmode(){
    
    if(settings["edit"]){
        settings["edit"] = false
        document.getElementById("edit").innerHTML = `<button class="btn btn-success w-100" onclick="editmode()" type="button">Edit Splits</button>`
    }
    else{
        settings["edit"] = true
        document.getElementById("edit").innerHTML = `<button class="btn btn-danger w-100" onclick="editmode()" type="button">End Editmode</button>`
    }

    const data = JSON.stringify(settings, null, 8);
    await savefile('./settings.json', data)

    location.reload()

}

async function remove_split(name){

    delete splits[splits["active_profile"][0]][name]

    const data = JSON.stringify(splits, null, 8);
    await savefile('./splits.json', data)

    location.reload()

}

async function new_split(){

    var name = document.getElementById('new_split').value

    if(name != ""){

        var profile = splits["active_profile"][0]
        splits[profile][name] = {
            "current": 0,
            "diff": 0,
            "pb": 0,
            "best": 0
        }

        const data = JSON.stringify(splits, null, 8);
        await savefile('./splits.json', data)

    }
    
    location.reload()

}


async function renameKey ( oldKey, newKey ) {

    var oldObj = splits[splits["active_profile"][0]]

    const renameObjKey = ({oldObj, oldKey, newKey}) => {
        const keys = Object.keys(oldObj);
        const newObj = keys.reduce((acc, val)=>{
          if(val === oldKey){
              acc[newKey] = oldObj[oldKey];
          }
          else {
              acc[val] = oldObj[val];
          }
          return acc;
        }, {});
      
        return newObj;
      };

    splits[splits["active_profile"][0]] = renameObjKey({oldObj, oldKey, newKey})

    const data = JSON.stringify(splits, null, 8);
    await savefile('./splits.json', data)

    location.reload()
  }


async function get_hit(hit){

    var splitname = Object.keys(splits[splits["active_profile"][0]]) [splits["active_profile"][2]]

    if(hit){
        splits[splits["active_profile"][0]][splitname]["current"] += 1
    }
    else{
        if((splits[splits["active_profile"][0]][splitname]["current"] - 1) >= 0){
            splits[splits["active_profile"][0]][splitname]["current"] -= 1
        }
    }
    
    const data = JSON.stringify(splits, null, 8);
    await savefile('./splits.json', data)

    location.reload()
}

// async function up(index){

//     const profile = splits["active_profile"][0]

//     for(var x in Object.entries(splits[profile]).splice(index)){
//         // console.log(x)
//     }

//     console.log(Object.entries(splits[profile]).slice(index))
//     // delete cur_splits[2]

//     const data = JSON.stringify(splits, null, 8);
//     await savefile('splits.json', data)

//     load_profiles();

// }