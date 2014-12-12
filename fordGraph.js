(function(window)
{
    var fordGraph = {};

    fordGraph.version = '0.0.1';

    fordGraph.generate = function(config)
    {
        var width = 800;
        var height = 600;
        var timer;

        var drawGraph = function(graph)
        {
            var mapNodesLinks = function(graph)
            {
                var obj = {};
                var nodes = graph.nodes;
                var links = graph.links;

                for (var i = 0; i < nodes.length; i++)
                {
                    obj[i] = {};
                    obj[i]['p'] = null;
                    obj[i]['c'] = [];
                }

                for (var i = 0; i < links.length; i++)
                {
                    obj[links[i].source]['c'].push(links[i].target);
                    obj[links[i].target]['p'] = links[i].source;
                }

                return obj;
            };
            //..........................................................................
            var nodesAndLinksRelationship = mapNodesLinks(graph);
            //..........................................................................
            var force = d3.layout.force()
                .size([width, height])
                .linkStrength(0.1)
                .friction(0.9)
                .distance(20)
                .gravity(0.04)
                .theta(0.8)
                .alpha(0.1)
                .linkDistance(40)
                .charge(-300)
                .on("tick", tick);
            //..........................................................................
            var svg = d3.select(config.bindto).append('svg')
                .attr('width', width)
                .attr('height', height);

            //..........................................................................

            var grayfilter = svg.append('filter')
                .attr('id', 'grayfilter')
                .append('feColorMatrix')
                .attr('type', 'saturate')
                .attr('values', 0);

            //..........................................................................

            var link_g = svg.append('g')
                .attr('class', 'link_g');

            var link = link_g.selectAll('.link');
            link = link.data(graph.links)
                .enter()
                .append('line')
                .attr('class' ,'link')
                .attr('stroke-width', 2)
                .attr('stroke', 'blue');

            //..........................................................................

            // group as node
            var g = svg.selectAll('.node');
            g = g.data(graph.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .on('dblclick', dblclick)
                .on('click', click)
                .on('mouseenter', mouseenter)
                .on('mouseleave', mouseleave)
                .call(force.drag);

            //..........................................................................

            var getLinksNumberOnNode = function(d)
            {
                return (nodesAndLinksRelationship[d.id].c.length + 1);
            };

            g.append('circle')
                .attr('r', function(d) { console.log(d); return 6 * getLinksNumberOnNode(d) })
                .attr('fill', 'red')
                .attr('stroke-width', function(d) { return getLinksNumberOnNode(d) })
                .attr('stroke', 'blue');
            // image
            g.append('svg:image')
                .attr('width', function(d) { return 6 * 2 * getLinksNumberOnNode(d) })
                .attr('height', function(d) { return 6 * 2 * getLinksNumberOnNode(d) })
                .attr('xlink:href', 'http://cdn.v2ex.com/avatar/4251/c47f/13372_large.png?m=1417693481')
                .attr('x', function(d) { return -6 * getLinksNumberOnNode(d) })
                .attr('y', function(d) { return -6 * getLinksNumberOnNode(d) })
            ;
            // label text
            g.append('text')
                .attr('fill', 'dark')
                .text(function(d) {return d.id});

            ////////////////////////////////////////////////////////////////////////////
            // force start draw
            force
                .nodes(graph.nodes)
                .links(graph.links)
                .start();

            //..........................................................................
            // functions
            function tick()
            {
                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                g.attr('transform', function(d) {return 'translate('+d.x+', '+d.y+')'});
            }

            function dblclick(d)
            {
                console.log(d);
                d3.select(this).classed('fixed', d.fixed = false);
            }

            function click(d)
            {
                console.log(d);
                d3.select(this).classed('fixed', d.fixed = true);
            }

            function mouseenter(d)
            {
                // change link
                d3.selectAll('.link')
                    .transition()
                    .duration(500)
                    .style('opacity', function(o)
                    {
                        // console.log(d, o);
                        return (d.index === o.source.index || d.id === o.target.index) ? 1 : .2
                    })
                    .style('stroke', function(o)
                    {
                        return (d.index === o.target.index) ? 'red' : 'blue'
                    })
                ;

                // change node
                d3.selectAll('.node')
                    .transition()
                    .duration(500)
                    .style('opacity', function(o)
                    {
                        return ( d.index === o.index || (nodesAndLinksRelationship[d.index].p === o.index) || (nodesAndLinksRelationship[d.index].c.indexOf(o.index) !== -1) ) ? 1 : .2
                    });

                var mouseCoordinate = d3.mouse(svg.node());
                clearTimeout(timer);
                timer = setTimeout(function()
                {
                    console.log('I am ' + d.index + ' , I want to show a tooltip', mouseCoordinate);
                }, 1000);
            }

            function mouseleave()
            {
                d3.selectAll('.link')
                    .transition()
                    .duration(500)
                    .style('opacity', 1)
                    .style('stroke', 'blue');

                d3.selectAll('.node')
                    .transition()
                    .duration(500)
                    .style('opacity', 1);

                clearTimeout(timer);
            }

            /*
             update grayfilter:
             d3.select(g[0][4]).attr('filter', 'url(#grayfilter)')
             */
        };

        //..........................................................................
        drawGraph.width = function(w)
        {
            if (!arguments.w)
                return width;

            if (w && typeof w == 'number')
                width = w;

            return drawGraph;
        };
        drawGraph.height = function(h)
        {
            if (!arguments.h)
                return height;

            if (h && typeof h == 'number')
                height = h;

            return drawGraph;
        };

        ////////////////////////////////////////////////////////////////////////////
        drawGraph(config.graph);

        return drawGraph;
    };

    window.fordGraph = fordGraph;

})(window);