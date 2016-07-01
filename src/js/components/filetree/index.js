const fs = require("fs");

const template = {
	template: require("./index.html"),
	data: () => {
		return {
			searchText : "",
			stores               : require("../../stores"),
			files                : require("../../stores/files"),
			config               : require("../../stores/config"),
			is_ended_constructor : false
		}
	},
	created: function() {
		var action = require("../../services/action");
		action.newFile = this.newFile;
		action.openFile = this.open;
		action.save = this.save;
		action.writeFile = this.writeFile;

		require("../../services/file_io")
		.getList(this.stores.config.root_dir)
		.then( (getFiles) => {
			getFiles.map( (file) => {
				this.stores.files.push({
					name    : file.name,
					content : file.content,
					active  : false,
					hide    : false,
					unsaved : false
				});
			});
		});

		this.newFile("");
	},

	methods: {
		newFile: function(name) {
			if( this.stores.files.find((file) =>{ return file.name == ""; }) === undefined){
				this.stores.files.map( (file) => {
					file.active = false;
					return file;
				});
				this.stores.files.unshift({
					name   : "",
					content: "",
					active : true,
					hide   : false
				});
			}
			this.open("");
		},

		save: function() {
			var target = null;
			var action = require("../../services/action");

			this.stores.files.map( (file) => {
				if(file.active){
					file.unsaved = false;
					target = file;
				}
				return file;
			});

			if (this.stores.currentFile.name == "") {
				action.showSaveDialog();
				return;
			}

			var target = this.stores.files.find( (file) => {
				return file.active;
			});
			this.writeFile(path.join(this.stores.config.root_dir, this.stores.currentFile.name), target.content);
		},

		writeFile: function() {
			require("../../services/file_io")
			.save(path.join(this.stores.config.root_dir, this.stores.currentFile.name), target.content)
			.catch( (err) => {
				alert("エラーが発生しました。\n" + err);
			});
		},

		open: function(e) {
			var name = e;
			if(typeof(event) == "object" ){
				name = event.target.dataset.filename;
			}

			var target = this.stores.files.map( (file) => {
					file.active = (file.name == name);
					return file;
				})
				.find( (file) => {
					return file.name == name;
				});

			var text    = target.content.replace(/\r\n|\r/g, "\n");
			var raw_content = text.split("\n");
			var title   = raw_content[0].replace("# ", "");
			var content = "";

			raw_content.shift();

			raw_content.forEach( (line) => {
				content += line + "\n";
			});

			this.stores.currentFile.name = target.name;
			this.stores.currentFile.title = title;
			this.stores.currentFile.content = content;

			if(this.is_ended_constructor === false){
				this.is_ended_constructor = true;
				return;
			}
			var action = require("../../services/action");
			action.preview(
				title,
				content,
				text
			);
		},

		search: function (){
			if(!this.stores.searchText){
				this.stores.files.map( (file) => {
					file.hide = false;
					return file;
				});
				return;
			}

			this.stores.files.map( (file) => {
				file.hide = (file.name.indexOf(this.stores.searchText) != 0);
				return file;
			});
		}
	}
};

module.exports = template;
