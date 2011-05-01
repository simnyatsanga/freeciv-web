/********************************************************************** 
 Freeciv - Copyright (C) 2009-2010 - Andreas Røsdal   andrearo@pvv.ntnu.no
   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2, or (at your option)
   any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
***********************************************************************/

var observing = false;
var chosen_nation = 1;
var ai_skill_level = 1;

/****************************************************************************
  ...
****************************************************************************/
function pregame_start_game()
{
  var test_packet = [{"packet_type" : "chat_msg_req", "message" : "/start"}];
  var myJSONText = JSON.stringify(test_packet);
  send_request (myJSONText);
}

/****************************************************************************
  ...
****************************************************************************/
function leave_pregame()
{
  window.location = "/wireframe.jsp?do=login";
}

/****************************************************************************
  ...
****************************************************************************/
function observe()
{
  if (observing) {
    $("#observe_button").text("Observe Game");
    var test_packet = [{"packet_type" : "chat_msg_req", "message" : "/detach"}];
    var myJSONText = JSON.stringify(test_packet);
    send_request (myJSONText);
    
  } else {
    $("#observe_button").text("Don't observe");
    var test_packet = [{"packet_type" : "chat_msg_req", "message" : "/observe"}];
    var myJSONText = JSON.stringify(test_packet);
    send_request (myJSONText);
  }
  
  observing = !observing;
}

/****************************************************************************
  ...
****************************************************************************/
function update_player_info()
{
  player_html = "";
  for (id in players) {
    player = players[id];
    if (player != null) {
      if (player['name'].indexOf("AI") != -1) {
        player_html += "<div id='pregame_player_name'><div id='pregame_ai_icon'></div><b>" 
                      + player['name'] + "</b></div>";
      } else {
        player_html += "<div id='pregame_player_name'><div id='pregame_player_icon'></div><b>" 
                      + player['name'] + "</b></div>";
      } 
    }
  }
  $("#pregame_player_list").html(player_html);


}


/****************************************************************************
  ...
****************************************************************************/
function pick_nation()
{

  var nations_html = "";
  
  nations_html += "<div id='nation_list'> ";
  for (var nation_id in nations) {
    var pnation = nations[nation_id];
    var sprite = get_nation_flag_sprite(pnation);
    nations_html += "<div onclick='select_nation(" + nation_id + ");' style='background: transparent url("
           + sprite['image-src'] 
           + "); background-position:-" + sprite['tileset-x'] + "px -" + sprite['tileset-y'] 
           + "px;  width: " + sprite['width'] + "px;height: " + sprite['height'] + "px; margin: 5px; '>"
           + "<div id='nation_" + nation_id + "' class='nation_choice'>" + pnation['adjective'] + "</div></div>";
  }

  
  nations_html += "</div><div id='nation_legend'></div>";
  
  $("#pick_nation_dialog").html(nations_html);
  $("#pick_nation_dialog").attr("title", "Which nation do you want to play?");
  $("#pick_nation_dialog").dialog({
			bgiframe: true,
			modal: true,
			width: "50%",
			buttons: {
				Ok: function() {
					$(this).dialog('close');
					submit_nation_choise(chosen_nation);
				}
			}
		});
	
  $("#pick_nation_dialog").dialog('open');		

}



/****************************************************************************
  ...
****************************************************************************/
function select_nation(nation_id)
{
  var pnation = nations[nation_id];
  $("#nation_legend").html(pnation['legend']);

  $("#nation_" + chosen_nation).css("background-color", "transparent");

  chosen_nation = nation_id
  
  $("#nation_" + chosen_nation).css("background-color", "#555555");
}

/****************************************************************************
  ...
****************************************************************************/
function submit_nation_choise(chosen_nation)
{
  var test_packet = [{"packet_type" : "nation_select_req", 
                      "player_no" : client.conn['player_num'],
                      "nation_no" : chosen_nation,
                      "is_male" : true, /* FIXME */
                      "name" : client.conn['username'],
                      "city_style" : nations[chosen_nation]['city_style']}];
  var myJSONText = JSON.stringify(test_packet);
  send_request (myJSONText);
  
  
}



/****************************************************************************
  ...
****************************************************************************/
function pregame_settings()
{
  var id = "#pregame_settings";
  $(id).remove();
  $("<div id='pregame_settings'></div>").appendTo("div#pregame_page");


  var dhtml = "<table>" +
	  "<tr><td>Number of Players (including AI):</td>" +
	  "<td><input type='text' name='aifill' id='aifill' size='3' length='3'></td></tr>" +
	  "<tr><td>Timeout (number of seconds per round):</td>" +
	  "<td><input type='text' name='timeout' id='timeout' size='3' length='3'></td></tr>" +
	  "<tr><td>Map size:</td>" +
	  "<td><input type='text' name='mapsize' id='mapsize' size='3' length='3'></td></tr>" +
	  "<tr><td>AI skill level:</td>" +
	  "<td><select name='skill_level' id='skill_level'>" +
	  "<option value='0'>Novice</option>" +
	  "<option value='1'>Easy</option>" +
          "<option value='2'>Normal</option>" +
          "<option value='3'>Hard</option>" +
	  "</select></td></tr>" +
	  "<tr><td>Network: HTML5 WebSocket support:</td>" +
	  "<td><input type='CHECKBOX' name='websockets' id='websockets_enable'></td></tr></table><br>" +
	  "<span id='settings_info'><i>Freeciv.net can be customized using the command line in many other ways also. Type /help in the command line for more information.</i></span>" 
	  ;
  $(id).html(dhtml);

  $(id).attr("title", "Game Settings");
  $(id).dialog({
			bgiframe: true,
			modal: false,
			width: "450",
			  buttons: {
				Ok: function() {
					$(this).dialog('close');
				}
			  }

  });

  $("#aifill").val(game_info['aifill']);
  $("#mapsize").val(game_info['mapsize']);
  $("#timeout").val(game_info['timeout']);
  $("#skill_level").val(ai_skill_level);

  var value = $.jStorage.get("websocket_enabled");
  if(value){
    $("#websockets_enable").attr('checked', true);
  } else {
    $("#websockets_enable").attr('checked', false);
  }

  $(id).dialog('open');		

  $('#aifill').change(function() {
    var test_packet = [{"packet_type" : "chat_msg_req", "message" : "/set aifill " + $('#aifill').val()}];
    var myJSONText = JSON.stringify(test_packet);
    send_request (myJSONText);
  });

  $('#mapsize').change(function() {
    var test_packet = [{"packet_type" : "chat_msg_req", "message" : "/set size " + $('#mapsize').val()}];
    var myJSONText = JSON.stringify(test_packet);
    send_request (myJSONText);
  });

  $('#timeout').change(function() {
    var test_packet = [{"packet_type" : "chat_msg_req", "message" : "/set timeout " + $('#timeout').val()}];
    var myJSONText = JSON.stringify(test_packet);
    send_request (myJSONText);
  });

  $('#skill_level').change(function() {
    ai_skill_level = parseFloat($('#skill_level').val());
    var test_packet = "";
    if (ai_skill_level == 0) {
      test_packet = [{"packet_type" : "chat_msg_req", "message" : "/novice"}];
    } else if (ai_skill_level == 1) {
      test_packet = [{"packet_type" : "chat_msg_req", "message" : "/easy"}];
    } else if (ai_skill_level == 2) {
      test_packet = [{"packet_type" : "chat_msg_req", "message" : "/normal"}];
    } else if (ai_skill_level == 3) {
      test_packet = [{"packet_type" : "chat_msg_req", "message" : "/hard"}];
    }
    var myJSONText = JSON.stringify(test_packet);
    send_request (myJSONText);
  });


  $('#websockets_enable').mouseover(function() {
    $("#settings_info").html("<i>You can choose between running Freeciv.net in the default AJAX mode, or with experimental HTML5 Websockets. " +
	   "WebSocket is only supported on some modern browsers. WebSockets requires restarting the game once enabled.</i>");
  });

  $('#websockets_enable').change(function() {
    var my_websocket_enabled = $('#websockets_enable').is(':checked');
    $.jStorage.set("websocket_enabled", my_websocket_enabled);
    if (my_websocket_enabled) {
      $("#settings_info").html("<i>You have activated HTML5 WebSocket support in Freeciv.net. " + 
	      "HTML5 WebSocket support is experiental, and only supported on some browsers. " + 
	      "<a href='/wireframe.jsp?do=menu'>Restarting Freeciv.net</a> is required to use WebSockets.</i>");
    } else {
      $("#settings_info").html("<i>You have activated the default AJAX network mode of Freeciv.net." +
	      " <a href='/wireframe.jsp?do=menu'>Restarting Freeciv.net</a> is required now.</i>"); 
    }
    show_dialog_message("Please restart Freeciv.net", 
      "You have changed the Websocket support option, and you will have to <a href='/wireframe.jsp?do=menu'>restart Freeciv.net</a> " +
      "for the change to take effect. Your setting will be stored for future games also.");


  });


}

