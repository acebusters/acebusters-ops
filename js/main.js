
const NODES = [
  {
    description: 'Mainnet read node 1',
    address:     'ec2-54-171-37-6.eu-west-1.compute.amazonaws.com'
  },
  {
    description: 'Mainnet read node 2',
    address:     'ec2-54-229-180-11.eu-west-1.compute.amazonaws.com'
  },
  {
    description: 'Mainnet write node',
    address:     'ec2-54-229-226-81.eu-west-1.compute.amazonaws.com'
  },
  {
    description: 'Rinkeby read node',
    address:     'ec2-54-171-251-232.eu-west-1.compute.amazonaws.com'
  },
  {
    description: 'Rinkeby write node',
    address:     'ec2-54-229-21-184.eu-west-1.compute.amazonaws.com'
  },
];


$(function () {

  const getBadge = function(healthcheckResp) {
    let blockBehind;
    try {
      blockBehind = parseInt(healthcheckResp);
    } catch (e) {}

    if (isNaN(blockBehind)) {
      return badge({ style: 'danger', text: 'Problem', message: healthcheckResp });
    }
    if (blockBehind === 0) {
      return badge({ style: 'success', text: 'Healthy' });
    }
    if (blockBehind > -4) {
      return badge({ style: 'warning', text: 'Lagging', message: `Node is off the network by ${-blockBehind} blocks` });
    }
    return badge({ style: 'danger', text: 'Out of sync', message: `Node is off the network by ${-blockBehind} blocks` });
  };

  $('[data-toggle="tooltip"]').tooltip();

  var listEntry = Handlebars.compile($('#list-entry-template').html());
  var badge = Handlebars.compile('<span class="badge badge-{{style}} pull-right" data-toggle="tooltip" title="{{message}}">{{text}}</span>');

  $('#geth-node-status-list').append(NODES.map(listEntry));

  NODES.forEach(node => {
    const nodeStatusBadge = $(`li[data-address="${node.address}"]`).find('.badge:first');
    $.get(`http://${node.address}:50336`).then(res => {
      console.log(`Node ${node.address}: ${res}`);
      nodeStatusBadge.replaceWith(getBadge(res));
    }).catch((res, err) => {
      console.log(`Node ${node.address}: ${err}`);
      if (res.responseText) {
        return nodeStatusBadge.replaceWith(getBadge(res.responseText));
      }
      if (err == 'error') return;
      nodeStatusBadge.replaceWith(badge({ style: 'danger', text: 'Unavailable', message: err }));
    });
  });

});
