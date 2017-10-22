module.exports = async function(keyword, cache,rec) {
	if(!cache)cache={};
    var request = require('request-promise-native');
	var parser=function(file) {
    var dep = [];
    try {
        file = JSON.parse(file);
        if (file.dependencies) {
            dep = Object.keys(file.dependencies);
        }
    } catch (e) {}
    return dep;
}
    async function get(url) {
		console.log(url,!!cache[url])
		
		return  cache[url]?cache[url]:cache[url]= await request({
            "method": "GET",
            "uri": url,
            "json": true,
            "headers": {
                "Authorization": "Bearer " + '<OAUTH TOKEN>',
                "User-Agent": "dependisearch"
            }
        });
    }
    var dep = [];
    if (!rec)rec = {};
    var v = {};
    var max = Infinity,
        sample = 0,
        pa = 1;
    var cons=100,x=0
    while (x < cons && x < max&& cons<=max) {
        try {
            var search = await get("https://api.github.com/search/repositories?q=" + keyword + "+language:" + "Javascript" + "&page=" + pa);
        } catch (e) {
        }
        max = search.total_count;
        search = search.items;
        for (var i = 0; i < search.length; i++) {
            var s = search[i];
            var dep;
            if (!cache[s.id]){
            var p = s.contents_url;
            p = p.split("/").slice(0, 8)
            p.pop();
            p.push("package.json");
            p = p.join("/");

            if (v[s.id]) continue;
            v[s.id] = 1
            try {
                var file = await get(p);
                file = Buffer.from(file.content, 'base64').toString();

            } catch (e) {
                continue;
            }

            dep =cache[s.id]= parser(file);
            }else{
            dep =cache[s.id]
            }
            if (dep.length) {
            sample++
            x++
            }
            dep.map(a => rec[a] = (rec[a] || 0) + 1)

        }
        pa++;
    }
    pa = 1;
    x=0;
    max = Infinity;
    while (x < cons && x < max&&cons<=max) {
        try {
            var search = await get("https://api.github.com/search/code?q=" + keyword + "+language:" + "Javascript" + "&page=" + pa);
        } catch (e) {
            break;
        }
        max = search.total_count;
        search = search.items;
        //console.log(search)

        for (var i = 0; i < search.length; i++) {
            var s = search[i];
             var dep;
            if (!cache[s.repository.id]){
            var p = s.url;
            p = p.split("/").slice(0, 6)
            p.push("package.json");
            p = p.join("/");

            if (v[s.repository.id]) continue;
            v[s.repository.id] = 1
            try {
                var file = await get(p);
                file = Buffer.from(file.content, 'base64').toString();

            } catch (e) {

                continue;
            }

			dep =cache[s.id]= parser(file);
            }else{
            dep =cache[s.id]
            }
            if (dep.length) {
            sample++
            x++
            }
            dep.map(a => rec[a] = (rec[a] || 0) + 1)

        }
        pa++;
    }
   
    return sample;
}
