document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

// Submit Handler
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Display the compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';
  
  // Reset the values of the composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  }
  
  function view_email(id){
  // Fetch the email with the given id
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
  // Print the email object
  console.log(email);

// Display the email detail view and hide other views
document.querySelector('#emails-view').style.display = 'none';
document.querySelector('#compose-view').style.display = 'none';
document.querySelector('#email-detail-view').style.display = 'block';

// Populate the email detail view with the email information
document.querySelector('#email-detail-view').innerHTML = `
  <ul class="list-group">
    <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
    <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
    <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
    <li class="list-group-item"><strong>Timestamp:</strong> ${email.timestamp}</li>
    <li class="list-group-item">${email.body}</li>
  </ul>
`;

// Change the email status to read if it's unread
if(!email.read) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
}

// Archive/Unarchive Logic
const btn_arch = document.createElement('button');
btn_arch.innerHTML = email.archived ? "Unarchive" : "Archive";
btn_arch.className = email.archived ? "btn btn-success" : "btn btn-danger";
btn_arch.addEventListener('click', function() {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !email.archived
    })
  })
  .then(() => {
    load_mailbox('archive');
  });
});
document.querySelector('#email-detail-view').append(btn_arch);

// Reply Logic
const btn_reply = document.createElement('button');
btn_reply.innerHTML = "Reply";
btn_reply.className = "btn btn-info";
btn_reply.addEventListener('click', function() {
  compose_email();

  // Populate the composition fields with the email information
  document.querySelector('#compose-recipients').value = email.sender;
  let subject = email.subject;
  if(subject.split(' ',1)[0] != "Re:"){
    subject = "Re: " + email.subject;
  }
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote ${email.body}`;
});
document.querySelector('#email-detail-view').append(btn_reply);
});
}


      
function load_mailbox(mailbox) {
  
  // Display the selected mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Display the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch the emails for the selected mailbox and user
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Create a div for each email
    emails.forEach(email => {
      const emailDiv = document.createElement('div');
      emailDiv.className = "list-group-item";
      emailDiv.innerHTML = `
        <h6>Sender: ${email.sender}</h6>
        <h5>Subject: ${email.subject}</h5>
        <p>${email.timestamp}</p>
      `;
      // Change the background color of the email div based on whether it has been read or not
      emailDiv.className = email.read ? 'read': 'unread';
      // Add a click event to view the email
      emailDiv.addEventListener('click', function() {
        view_email(email.id)
      });
      document.querySelector('#emails-view').append(emailDiv);  
    });  

  });

}

function send_email(event){
  event.preventDefault();

  // Get the values of the email fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;


  // Send the email data to the server
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print the result to the console
      console.log(result);
      load_mailbox('sent');
  });
}
