ShowTeam = function(div) {
  this.div = div;
  this.days = gitExplorer.get('day');
  this.team = gitExplorer.get('team');
  this.allMembers = [];
  _.each(this.team, function(team) {
    this.allMembers.push(team);
  }, this);
  this.allMembers = _.uniq(_.flatten(this.allMembers));
  this.allMembers.sort();

  this.setUpMembers();
}

ShowTeam.prototype = {
  memberNameToImageName: function(name) {
    return ;
  },

  setUpMembers: function() {
    this.memberDivs = {};
    this.div.empty();
    _.each(this.allMembers, function(member) {
      var imageName = member.split(' ')[0].toLowerCase();
      this.memberDivs[member] = $('<div class="member" id="" style="background-image:url(images/' + imageName + '.jpeg);"></div>');
      this.div.append(this.memberDivs[member]);
    }, this);
    this.countDiv = $('<div class="count"></div>')
    this.div.append(this.countDiv);
    this.div.append($('<div class="count-label">pivots</div>'))
  },

  draw: function(options) {
    this.drawTeam(this.team[options.dayIndex]);
  },

  drawTeam: function(team) {
    this.countDiv.html(team.length)
    $('.member.visible').removeClass('visible')
    _.each(team, function(member) {
      this.memberDivs[member].addClass('visible');
    }, this);
  }
}