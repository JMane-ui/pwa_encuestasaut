(function() {

    'use strict';
  
    var ENTER_KEY = 13;
    var newCommentDom = document.getElementById('new-comment');
    var syncDom = document.getElementById('sync-wrapper');
  
    // EDITING STARTS HERE (you dont need to edit anything above this line)
  
    var db = new PouchDB('comments');
    var remoteCouch = false;
  
    db.changes({
      since: 'now',
      live: true
    }).on('change', showComments);db.changes({
      since: 'now',
      live: true
    }).on('change', showComments);
  
    // We have to create a new comment document and enter it in the database
    function addComment(text) {
  
      if( text.length == 0 ){
        return;
      }
  
      var comment = {
        _id: new Date().toISOString(),
        title: text,
        completed: false
      };
      /*db.put(comment, function callback(err, result) {
        if (!err) {
          console.log('Successfully posted a comment!');
        }
      });*/
  
      db.put(comment)
        .then(console.log('Insertado'))
        .catch(console.log())
    }
  
    // Show the current list of comments by reading them from the database
    function showComments() {
      /*db.allDocs({include_docs: true, descending: true}, function(err, doc) {
        redrawCommentsUI(doc.rows);
      });*/
  
      db.allDocs({include_docs: true, descending: true})
        .then(doc => {
          redrawCommentsUI(doc.rows);
        })
    }
  
    function checkboxChanged(comment, event) {
      console.log(comment);
      console.log(event);
      comment.completed = event.target.checked;
      db.put(comment);
    }
  
    // User pressed the delete button for a comment, delete it
    function deleteButtonPressed(comment) {
      db.remove(comment);
    }
  
    // The input box when editing a comment has blurred, we should save
    // the new title or delete the comment if the title is empty
    function commentBlurred(comment, event) {
      var trimmedText = event.target.value.trim();
  
      if( trimmedText.length == 0 ){
        return;
      }
  
      if (!trimmedText) {
        db.remove(comment);
      } else {
        comment.title = trimmedText;
        db.put(comment);
      }
    }
  
    // Initialise a sync with the remote server
    function sync() {
    }
  
    // EDITING STARTS HERE (you dont need to edit anything below this line)
  
    // There was some form or error syncing
    function syncError() {
      syncDom.setAttribute('data-sync-state', 'error');
    }
  
    // User has double clicked a comment, display an input so they can edit the title
    function commentDblClicked(comment) {
      var div = document.getElementById('li_' + comment._id);
      var inputEditComment = document.getElementById('input_' + comment._id);
      div.className = 'editing';
      inputEditComment.focus();
    }
  
    // If they press enter while editing an entry, blur it to trigger save
    // (or delete)
    function commentKeyPressed(comment, event) {
      if (event.keyCode === ENTER_KEY) {
        var inputEditComment = document.getElementById('input_' + comment._id);
        inputEditComment.blur();
      }
    }
  
    // Given an object representing a comment, this will create a list item
    // to display it.
    function createCommentListItem(comment) {
      var checkbox = document.createElement('input');
      checkbox.className = 'toggle';
      checkbox.type = 'checkbox';
      checkbox.addEventListener('change', checkboxChanged.bind(this, comment));
  
      var label = document.createElement('label');
      label.appendChild( document.createTextNode(comment.title));
      label.addEventListener('dblclick', commentDblClicked.bind(this, comment));
  
      var deleteLink = document.createElement('button');
      deleteLink.className = 'destroy';
      deleteLink.addEventListener( 'click', deleteButtonPressed.bind(this, comment));
  
      var divDisplay = document.createElement('div');
      divDisplay.className = 'view';
      divDisplay.appendChild(checkbox);
      divDisplay.appendChild(label);
      divDisplay.appendChild(deleteLink);
  
      var inputEditComment = document.createElement('input');
      inputEditComment.id = 'input_' + comment._id;
      inputEditComment.className = 'edit';
      inputEditComment.value = comment.title;
      inputEditComment.addEventListener('keypress', commentKeyPressed.bind(this, comment));
      inputEditComment.addEventListener('blur', commentBlurred.bind(this, comment));
  
      var li = document.createElement('li');
      li.id = 'li_' + comment._id;
      li.appendChild(divDisplay);
      li.appendChild(inputEditComment);
  
      if (comment.completed) {
        li.className += 'complete';
        checkbox.checked = true;
      }
  
      return li;
    }
  
    function redrawCommentsUI(comments) {
      var ul = document.getElementById('comment-list');
      ul.innerHTML = '';
      comments.forEach(function(comment) {
        ul.appendChild(createCommentListItem(comment.doc));
      });
    }
  
    function newCommentKeyPressHandler( event ) {
      if (event.keyCode === ENTER_KEY) {
        addComment(newCommentDom.value);
        newCommentDom.value = '';
      }
    }
  
    function addEventListeners() {
      newCommentDom.addEventListener('keypress', newCommentKeyPressHandler, false);
    }
  
    addEventListeners();
    showComments();
  
    if (remoteCouch) {
      sync();
    }
  
  })();


if( navigator.serviceWorker ){
    console.log('Se cargó el service worker');
    navigator.serviceWorker.register('./sw.js')
        .then( resp => console.log('Todo bien: ', resp))
        .catch(error => console.log('Algo mal: ', error))
}else{
    console.log('No se aceptó el service worker');
}