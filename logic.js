const fs = require('fs').promises
const settings = require(__dirname + "/settings.json")
var splits = require(__dirname + "/splits.json")
const { dialog } = require('electron')
var keycode = require('keycode');
var gkm = require('gkm');

async function savefile(file, data){
    await fs.writeFile(file, data, (err) => {
        if (err) {
            throw err;
        }
    });
}

async function set_key(key){

    console.log(key)
    console.log(key.id)
    key.classList.remove("bg-success")
    key.classList.add("bg-danger")

    settings.edit_hk = true
    var data = JSON.stringify(settings, null, 8);
    await savefile(__dirname + "/settings.json", data)

    var key_code = await waitingKeypress();


    settings["hotkeys"][key.id] = key_code
    settings.edit_hk = false
    key.innerHTML = key_code

    data = JSON.stringify(settings, null, 8);
    await savefile(__dirname + "/settings.json", data)

    
    key.classList.remove("bg-danger")
    key.classList.add("bg-success")
    location.reload();

}

async function set_hotkeys(){

    document.getElementById("hk_add_hit").innerHTML = settings.hotkeys.hk_add_hit
    document.getElementById("hk_remove_hit").innerHTML = settings.hotkeys.hk_remove_hit
    document.getElementById("hk_reset_hit").innerHTML = settings.hotkeys.hk_reset_hit
    document.getElementById("hk_down_split").innerHTML = settings.hotkeys.hk_down_split
    document.getElementById("hk_up_split").innerHTML = settings.hotkeys.hk_up_split

}

gkm.events.on("key.released", function(data) {
	get_hotkey(data);
});
function get_hotkey(e){

    if(!settings.edit_hk){
    var hotkeys = settings.hotkeys
    var hotkey = Object.keys(hotkeys).find(key => hotkeys[key] === e[0]);
    if (hotkey == "hk_add_hit"){
        get_hit(true)
    }
    else if (hotkey == "hk_remove_hit"){
        get_hit()
    }
    else if (hotkey == "hk_reset_hit"){
        reset_splits()
    }
    else if (hotkey == "hk_down_split"){
        set_split()
    }
    else if (hotkey == "hk_up_split"){
        set_split(false)
    }}
}

function waitingKeypress() {
    return new Promise((resolve) => {
        document.addEventListener('keydown', onKeyHandler);
        console.log(document.hasOwnProperty('keydown'));
        function onKeyHandler(e) {
            gkm.events.on('key.*', function(data) {
                console.log(this.event + ' ' + data);
                document.removeEventListener('keydown', onKeyHandler);
                resolve(data[0]);
            });
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
                    <input type="text" class="form-control" id="new_split" placeholder="Split-Name" onkeydown="check_enter(event)">
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
        await savefile(__dirname + '/splits.json', data)

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
    document.getElementById("new_split").focus();

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
    await savefile(__dirname + '/splits.json', data)

    location.reload()

}

async function add_profile(){
    
    const name = document.getElementById("new_profile").value
    
    splits[name] = {}

    const data = JSON.stringify(splits, null, 8);
    await savefile(__dirname + '/splits.json', data)

    load_profiles();

}

async function set_split(next = true){

    var splits = require(__dirname + "/splits.json")

    if( splits["active_profile"][2] >= ( Object.keys( splits[splits["active_profile"][0]] ).length-1 ) && next){


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
    else if (next == false){
        var splits = require(__dirname + "/splits.json")

        if (splits["active_profile"][2] > 0){
            splits["active_profile"][2] -= 1
        }

    }
    else if (next == true){
        var splits = require(__dirname + "/splits.json")

        splits["active_profile"][2] += 1

    }

    
    const data = JSON.stringify(splits, null, 8);
    await savefile(__dirname + "/splits.json", data)

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
    await savefile(__dirname + '/settings.json', data)

    location.reload()

}

async function remove_split(name){

    delete splits[splits["active_profile"][0]][name]

    const data = JSON.stringify(splits, null, 8);
    await savefile(__dirname + '/splits.json', data)

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
        await savefile(__dirname + '/splits.json', data)

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
    await savefile(__dirname + '/splits.json', data)

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
    await savefile(__dirname + '/splits.json', data)

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