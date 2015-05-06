//Model
var Contact = Backbone.Model.extend({
  defauts: {
    lastname: 'Desjardins',
    firstname: 'Marc',
    phone: '12345'
  }

});

//Collection
var ContactsList = Backbone.Collection.extend({
  model: Contact,

  save: function(model) {
      var localeStorageData = localStorage.getItem('Contacts');
      if(localeStorageData){
        var contacts = JSON.parse(localeStorageData);
        contacts.push(this.toJSON()[0]);
        localStorage.setItem("Contacts", JSON.stringify(contacts));
      }
      else{
        localStorage.setItem("Contacts", JSON.stringify(this.toJSON()));
      }
    }
});

//instance of collection
var contact_list = new ContactsList();

//Router
var AppRouter = Backbone.Router.extend({
  routes: {
      "": "new_contact",
      "new-contact": "new_contact",
      "contacts-list": "contacts_list",
      "help": "help"
    },

  deselectPills: function(){
      //deselect all navigation pills
      $('ul.nav.nav-pills.nav-stacked li').removeClass('active');
    },

    selectPill: function(pill){
      //deselect all navigation pills
      this.deselectPills();

      //select passed navigation pill by selector
      $(pill).addClass('active');
    },

    hidePages: function(){
      //hide all pages with 'pages' class
      $('div.pages').hide();
    },

    showPage: function(page){
      //hide all pages
      this.hidePages();
      //show passed page by selector
      $(page).show();
    },

    new_contact: function() {
      this.showPage('div#new-contact-page');
      this.selectPill('li.new-contact-pill');
      var new_contact_view = new NewContactView({ collection: contact_list }).render().el;
      $('#new_contact_container').html(new_contact_view);
    },

    contacts_list: function() {
      this.showPage('#contacts-list-page');
      this.selectPill('li.contacts-list-pill');
      $('#contacts_list_container').empty();

      //get localstorage datas
      var contacts = JSON.parse(localStorage.getItem('Contacts'));
      if ( contacts.length > 0 ) {
        contacts.forEach(function( entry ) {
           this.$('#contacts_list_container').append(new ContactListView({ model: entry}).render().el, this.collection);
        })
      }
    },

    help: function() {
      this.showPage('#help-page');
      this.selectPill('li.help-pill');
    }
});


//View to show contacts 
var ContactListView = Backbone.View.extend({
  template: _.template('<tr id=contact>\
                       <td width="50%" id="list_last_name" contenteditable="true"><%=lastname%></td>\
                       <td width="30%" id="list_first_name"contenteditable="true"><%=firstname%></td>\
                       <td width="30%" id="list_phone" contenteditable="true"><%=phone%></td>\
                       <td width="auto"><input type="button" id="update_button" value="Update" /></td>\
                       <td width="auto"><input type="button" id="remove_button" value="Remove" /></td>\
                       </tr>'),

   events: {
            "click #update_button": "updateContact",
            "click #remove_button": "removeContact"
        },

  render: function(model, collection) { 
    this.$el.html( this.template(this.model ));
   
    return this;
  },

  updateContact: function () {
    var contact = this.model;
    var lname = this.$("#list_last_name").html();
    var fname = this.$("#list_first_name").html();
    var phone = this.$("#list_phone").html();

    //get localstorage datas
    var contacts = JSON.parse( localStorage.getItem('Contacts') );
    if ( contacts.length > 0 ) {
        contacts.forEach(function( entry ) {
        if ( contact.lastname === entry.lastname && contact.phone === entry.phone ) {
              entry.lastname = lname;
              entry.firstname = fname;
              entry.phone = phone;
        }
      }),

        //save data in localStorage
        localStorage.setItem("Contacts", JSON.stringify(contacts));
    }
  },

  removeContact: function () {
    var model = this.model;
    var contacts = JSON.parse( localStorage.getItem('Contacts') );
    if ( contacts.length > 0 ) {
        contacts.forEach(function( entry ) {
          console.log( entry );
          console.log( model);
        if ( model.lastname === entry.lastname && model.firstname === entry.firstname && model.phone === entry.phone ) {
             contacts.pop(entry);
             alert( "contact remove");
        }
      }),

        //save data in localStorage
        localStorage.setItem("Contacts", JSON.stringify(contacts));
    }
    this.$('#contact').remove();
  }
});

//Main view
var NewContactView = Backbone.View.extend({
  //define a template
  template: _.template('<form class="navbar-form navbar-left" role="save-contact">\
                         <fieldset>\
                          <table>\
                            <tr><td><label>Familly name</label></td><td><input type="text" id="last-name" class="form-control" placeholder="Familly name" required></td></tr>\
                            <tr><td><label>Given name</label></td><td><input type="text" id="first-name" class="form-control" placeholder="Given name"></td></tr>\
                            <tr><td><label>Phone </label></td><td><input type="text" id="phone" class="form-control" placeholder="Phone number" required></td></tr>\
                            <tr><td></td><td></td></tr>\
                            <tr><td></td><td><button type="submit" class="btn btn-default" id="add_button">Add</button><button type="reset" class="btn btn-default">Reset</button></td></tr>\
                         </table>\
                          </fieldset>\
                      </form>'),

  // initialize: function() {
  //   this.listenTo(this.collection, 'add', this.addItem);
  // },

  events: {
            "click #add_button": "addContact",
            "click #reset_button": 'removeItems'
        },

  addContact: function(event) {
    var lname = this.$("#last-name").val();
    var fname = this.$("#first-name").val();
    var phone = this.$("#phone").val();

    this.collection.add({ lastname: lname, firstname: fname, phone: phone });
    this.collection.save();
    alert("Contact is save");
    this.removeItems();
  },

  removeItems: function() {
      this.$("#last-name").val('');
      this.$("#first-name").val('');
      this.$("#phone").val('');
  },

   render: function() {
   this.$el.html( this.template );
    //this.collection.each(this.addItem, this);
    return this;
  }
});


var ApplicationView = Backbone.View.extend({

    //bind view to body element (all views should be bound to DOM elements)
    el: $('body'),

    //observe navigation click events and map to contained methods
    events: {
      'click ul.nav.nav-pills.nav-stacked li.new-contact-pill a': 'displayNewContact',
      'click ul.nav.nav-pills.nav-stacked li.contacts-list-pill a': 'displayContactsList',
      'click ul.nav.nav-pills.nav-stacked li.help-pill a': 'displayHelp'
    },

    //called on instantiation
    initialize: function(){
      //set dependency on ApplicationRouter
      this.router = new AppRouter();

      //call to begin monitoring uri and route changes
      Backbone.history.start();
    },

    displayNewContact: function(){
      //update url and pass true to execute route method
     
      this.router.navigate("new-contact", true);
    },

    displayContactsList: function(){
      //update url and pass true to execute route method
     
      this.router.navigate("contacts-list", true);
    },

    displayHelp: function(){
      //update url and pass true to execute route method
    
      this.router.navigate("help", true);
    }

  });

new ApplicationView();