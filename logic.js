const fs = require('fs').promises
const settings = require("./settings.json")
const splits = require("./splits.json")

async function savefile(file, data){
    await fs.writeFile(file, data, (err) => {
        if (err) {
            throw err;
        }
    });
}

async function load_splits(name){

    var content = ""

    var values = splits[name]
    // document.getElementById("edit").innerHTML = `<button class="btn btn-success w-100" onclick="editmode()" type="button">Edit Splits</button>`

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
                <td>${x}</td>
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
        
        <table class="table text-center table-dark table-striped">
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
            var diff = values[x]["diff"]
            var pb = values[x]["pb"]
            var best = values[x]["best"]
    
            content += `
            <tr>
            <td>${x}</td>
            <td>${curr}</td>
            <td>${diff}</td>
            <td>${pb} (${best})</td>
            </tr>`
        }
    
        splits["active_profile"] = [name, Object.keys(values)[0], 0]
        document.getElementById("dropdownMenuButton1").innerText = splits["active_profile"][0]
    
        const data = JSON.stringify(splits, null, 8);
        await savefile('./splits.json', data)

    }
    

    document.getElementById("splits").innerHTML = content

}

function load_profiles(){

    var content = ""

    for (var x in splits){
        if(x != "active_profile"){
            console.log(x)
            content += `<li><a class="dropdown-item " onclick='load_splits("${x}")'>${x}</a></li>`
        }
    }
    
    if(!settings["edit"]){
        document.getElementById("edit").innerHTML = `<button class="btn btn-success w-100" onclick="editmode()" type="button">Edit Splits</button>`
    }
    else{
        document.getElementById("edit").innerHTML = `<button class="btn btn-danger w-100" onclick="editmode()" type="button">End Editmode</button>`
    }

    if(splits["active_profile"][0]){
        load_splits(splits["active_profile"][0])
    }
    
    document.getElementById("profiles").innerHTML = content

}

async function add_profile(){
    
    const name = document.getElementById("new_profile").value
    
    splits[name] = {}

    const data = JSON.stringify(splits, null, 8);
    await savefile('./splits.json', data)

    load_profiles();

}

function set_split(){
    console.log()
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

    console.log(splits[splits["active_profile"][0]])
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