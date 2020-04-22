function makeTopTen(){
    // make top ten database
    this.Top10=new TopTen();
    if ((gwcat.meta)&&(gwcat.meta.gwosc)){
        document.getElementById('gwosc-build-date').innerHTML = gwcat.meta.gwosc.retrieved
        document.getElementById('gwosc-build-url').setAttribute('href',gwcat.meta.gwosc.src)
    }
    if ((gwcat.meta)&&(gwcat.meta.graceDB)){
        document.getElementById('gracedb-build-date').innerHTML = gwcat.meta.graceDB.retrieved
        document.getElementById('gracedb-build-url').setAttribute('href',gwcat.meta.graceDB.src)
    }
    if ((gwcat.meta)&&(gwcat.meta.manual)){
        document.getElementById('manual-build-date').innerHTML = gwcat.meta.manual.retrieved
        document.getElementById('manual-build-url').setAttribute('href',gwcat.meta.manual.src)
    }
}

function TopTen(){
    this.init();
    return this;
}
TopTen.prototype.init = function(){
    // add columns
    addColumn('Delay',calcDelay,{sigfig:2,err:0,name_en:'Time waiting',unit_en:'Days'})
    addColumn('Mratio',calcMratio,{sigfig:2,err:0,name_en:'Mass ratio'})
    addColumn('Mtotal',calcMtotal,{'unit_en':'M_sun',sigfig:3,err:0,name_en:'Total mass'})
    // define lists
    this.lists={
        // 'totmass':{sortcol:'Mtotal',order:'dec',format:'',title:'Total Mass',icon:'img/mass.svg',icon_unit:10,show_err:true},
        // 'mratio':{sortcol:'Mratio',order:'asc',format:'',title:'Mass Ratio',bar:'#000000',bar_min:0,bar_max:1,show_err:true},
        'mfinal':{sortcol:'Mfinal',order:'dec',format:'',show_err:true,default:true,
            graph:{type:'icon',icon:'img/mass.svg',icon_unit:1,iconlabel:'1 M_sun'}},
        // 'loc':{sortcol:'deltaOmega',order:'asc',format:'',namelink:false,hoverlink:true,
        //     graph:{type:'bar',bar:'#000000',bar_min:1,bar_max:40000,bar_log:true}},
        'loc':{sortcol:'deltaOmega',order:'asc',format:'',namelink:false,hoverlink:true,
            graph:{type:'bar',bar:'#000000',bar_min:1,bar_max:40000,bar_log:true}},
        'delay':{sortcol:'Delay',valcol:'Delay',order:'asc',format:'',title:'Days waiting',
            graph:{type:'none'}},
        'distance':{sortcol:'DL',order:'asc',format:'',title:'Distance',show_err:true,
            graph:{type:'bar',bar:'#000000',bar_max:'auto'}},
        'date':{sortcol:'GPS',valcol:'UTC',order:'asc',format:'date',title:'Detection Date',unit:'UTC',
            graph:{type:'none'}},
        'FAR':{sortcol:'FAR',order:'asc',format:'',sigfig:2,
            graph:{type:'iconfn',icon:imgFARfn,icon_fn:iconFARfn}},
        'Erad':{sortcol:'Erad',order:'dec',format:'',show_err:true,
            graph:{type:'icon',icon:'img/sun.svg',icon_unit:1}},
        'Lpeak':{sortcol:'lpeak',order:'dec',format:'',show_err:true,
            graph:{type:'icon',icon:'img/bulb.svg',icon_unit:1}},
        'SNR':{sortcol:'rho',order:'dec',format:'',default:false,
            graph:{type:'bar',bar:'#ffffff',bar_img:'img/snrwave.svg',bar_min:'auto',bar_max:30,bar_height:'3em'}},
    };
    // this.makeAllDivs();
    this.buildSelector();
    for (l in this.lists){
        this.makeDiv(l);
        this.popList(l);
        this.makeList(l);
    }
    for (l in this.lists){
        if (this.lists[l].default){
            this.selectList(l);
        }
    }

}
TopTen.prototype.buildSelector = function(holderid='selectorholder'){
    var _t10=this;
    sd=d3.select((holderid[0]=='#')?holderid:'#'+holderid);
    for (l in this.lists){
        sid="selector-"+l;
        var listitem=this.lists[l];
        if (listitem.title){
            title=listitem.title;
        }else{
            title=gwcat.paramName((listitem.valcol)?listitem.valcol:listitem.sortcol);
        }
        order=(listitem.order=='asc')?'&uarr;':'&darr;';
        sd.append('div')
            .attr('class','selector')
            .attr('id',sid)
        d3.select('#'+sid).append('div')
            .attr('class','selectorder')
            .attr('id','selorder-'+l)
            .html(order)
        d3.select('#selorder-'+l).on("click",function(){
            thisl=this.id.replace('selorder-','')
            _t10.reorderList(thisl);
        })
        d3.select('#'+sid).append('div')
            .attr('class','select')
            .attr('id','select-'+l)
            .html(title)
        d3.select('#select-'+l).on("click",function(){
            sellist=this.id.replace('select-','');
            _t10.selectList(sellist);
        })
    }
    // sd.append('div')
    //     .attr('class','selector')
    //     .attr('id',"selector-all")
    // d3.select('#selector-all').append('div')
    //     .attr('class','select')
    //     .attr('id','select-all')
    //     .html("All")
    // d3.select('#select-all').on("click",function(){
    //     sellist=this.id.replace('select-','');
    //     _t10.selectList(sellist);
    // })
}
TopTen.prototype.selectList = function(l){
    console.log('selected',l)
    d3.selectAll('.selector')
        .classed('selected',false);
    d3.select('#selector-'+l)
        .classed('selected',true);
    d3.selectAll('.key-item.key-icon')
        .classed('selected',false);
    d3.selectAll('.key-item.key-icon.'+l)
        .classed('selected',true);
    if (l=='all'){
        d3.selectAll('.top10list')
            .classed('selected',true);
    }else{
        d3.selectAll('.top10list')
            .classed('selected',false);
        d3.select('#list-'+l)
            .classed('selected',true);
    }

}
TopTen.prototype.makeAllDivs = function(holderid='top10holder'){
    // make divs for all lists
    hd=d3.select((holderid[0]=='#')?holderid:'#'+holderid);
    for (l in this.lists){
        lid='list-'+l;
        hd.append('div')
            .attr('class','top10list')
            .attr('id',lid)
    }
}
TopTen.prototype.makeDiv = function(l,holderid='top10holder'){
    // make divs for single lists
    hd=d3.select((holderid[0]=='#')?holderid:'#'+holderid);
    lid='list-'+l;
    hd.append('div')
        .attr('class','top10list selected')
        .attr('id',lid)
}
TopTen.prototype.popList = function(l){
    // populate list object with events/values
    var listitem=this.lists[l];
    gwcat.orderData(listitem.sortcol,(listitem.order=='dec')?true:false);
    listitem.names=[];
    listitem.values=[];
    listitem.valtypes=[];
    listitem.errpos=[];
    listitem.errneg=[];
    listitem.labels=[]
    // if (listitem.namelink){listitem.namelinks=[]}
    // if (listitem.vallink){listitem.vallinks=[]}
    // if (listitem.hoverlink){listitem.hoverlinks=[]}
    var num=0;
    for (n in gwcat.dataOrder){
        if (num>=10){continue}
        if (gwcat.getNominal(gwcat.dataOrder[n],listitem.sortcol)){
            listitem.names.push(gwcat.dataOrder[n]);
            listitem.valtypes.push(gwcat.getParamType(gwcat.dataOrder[n],(listitem.valcol)?listitem.valcol:listitem.sortcol));
            listitem.values.push(gwcat.getNominal(gwcat.dataOrder[n],(listitem.valcol)?listitem.valcol:listitem.sortcol))
            if (listitem.show_err){
                listitem.errneg.push(
                    gwcat.getMinVal(gwcat.dataOrder[n],(listitem.valcol)?listitem.valcol:listitem.sortcol));
                listitem.errpos.push(gwcat.getMaxVal(gwcat.dataOrder[n],(listitem.valcol)?listitem.valcol:listitem.sortcol));
            }else{
                listitem.errpos.push(Math.NaN);
                listitem.errneg.push(Math.NaN);
            }
            console.log(n,gwcat.dataOrder[n])
            if (gwcat.data[gwcat.event2idx(gwcat.dataOrder[n])][(listitem.valcol)?listitem.valcol:listitem.sortcol].label){
                listitem.labels.push(gwcat.data[gwcat.event2idx(gwcat.dataOrder[n])][(listitem.valcol)?listitem.valcol:listitem.sortcol].label);
            }else{
                listitem.labels.push('');
            }
            num+=1;
        }
    }
    this.lists[l]=listitem;
}
TopTen.prototype.makeList = function(l){
    // add divs for list
    var _t10=this;
    var listitem=this.lists[l];
    lid='list-'+l;
    ldiv=d3.select('#'+lid)
    ldiv.selectAll("*").remove();
    ldiv.append('div')
        .attr('class','list-title')
        .html(this.gettitle(l))
    d3.select('#order-'+l).on("click",function(){
        thisl=this.id.replace('order-','')
        _t10.reorderList(thisl);
    })
    if (listitem.graph.type=='icon'){
        // add icon to key
        if(listitem.graph.iconlabel){
            iconlabel=listitem.graph.iconlabel;
        }else{
            iconlabel=listitem.graph.icon_unit+' x '+
            gwcat.paramUnit((listitem.valcol)?listitem.valcol:listitem.sortcol);
        };
        iconlabel.replace('M_sun',)
        iconlabel=iconlabel.replace('M_sun','M<sub>☉</sub>')
        reSup=/\^(-?[0-9]*)(?=[\s/]|$)/g
        iconlabel=iconlabel.replace(reSup,"<sup>$1</sup> ");
        var keyhtml='<div class="key-icon"><img src="'+listitem.graph.icon+'">'+
            '<div class="evname key-icon">'+iconlabel+'</div></div>'
        d3.select('#keyholder > .keyouter').append('div')
            .attr('class','key-item key-icon '+l)
            .html(keyhtml)
    }
    for (n in listitem.names){
        evtype=(listitem.names[n][0]=='G')?'GW':'Cand';
        evodd=(n%2==0)?'even':'odd';
        ldiv.append('div')
            .attr('class','list-item '+evtype+' '+evodd)
            .attr('id',l+'_'+n)
            .html(this.gethtml(l,n))
        if (listitem.graph.type=='icon' || listitem.graph.type=='iconfn'){
            this.addicons(l,n);
        }
        if (listitem.graph.type=='bar'){
            this.addbar(l,n);
        }
        this.addinfo(l,n);
        if (d3.select('#'+l+'_'+n).node().clientHeight>0){d3.select('#'+l+'_'+n).classed('large',true)}
        // ldiv.select('#'+l+'_'+n).on("mouseover",function(){
        //     _t10.showTooltip(d3.event,this.id.split('_')[0],this.id.split('_')[1]);
        // });
        // ldiv.on("mouseout",function(){
        //     _t10.hideTooltip();
        // });
    }
}
TopTen.prototype.gettitle = function(l){
    // get title for list
    var listitem=this.lists[l];
    title=(listitem.title)?listitem.title:gwcat.paramName((listitem.valcol)?listitem.valcol:listitem.sortcol);
    order=(listitem.order=='asc')?'&uarr;':'&darr;'
    titorder='<div class="listorder" id="order-'+l+'">'+order+'</div>';
    titname='<div class="listname">'+title+'</div>';
    unit=(listitem.unit)?listitem.unit:gwcat.paramUnit((listitem.valcol)?listitem.valcol:listitem.sortcol);
    // unit=gwcat.paramUnit(listitem.sortcol)
    unit=unit.replace('M_sun','M<sub>☉</sub>')
    reSup=/\^(-?[0-9]*)(?=[\s/]|$)/g
    unit=unit.replace(reSup,"<sup>$1</sup> ");
    titunit='<div class="listunit">'+unit+'</div>';
    return(titorder+titname+titunit)
}
TopTen.prototype.gethtml = function(l,n){
    // get html for list item
    listitem=this.lists[l];
    sigfig=(listitem.hasOwnProperty('sigfig'))?listitem.sigfig:gwcat.datadict[listitem.sortcol].sigfig;
    var val=setPrecision(listitem.values[n],sigfig);
    var htmlerr='';
    if (listitem.valtypes[n]=='lower'){val='> '+val}
    else if (listitem.valtypes[n]=='upper'){val='< '+val}
    if (listitem.show_err && listitem.valtypes[n]=='best'){
        fixprec=getprecision(listitem.values[n],sigfig);
        errpos=setPrecision(listitem.errpos[n]-listitem.values[n],sigfig,fixprec=fixprec)
        errneg=setPrecision(listitem.values[n]-listitem.errneg[n],sigfig,fixprec=fixprec)
        htmlerr='<div class="everr pos">+'+errpos+'</div><div class="everr neg">&ndash;'+errneg+'</div>'
    }else{
        htmlerr=''
    }
    var namelink='';
    var hoverlink='';
    if (listitem.namelink){
        // get skymaps URL
        if (listitem.sortcol=='deltaOmega'){
            namelink='<a title="Skymaps" href="skymaps.html#'+gwcat.dataOrder[n]+'">';
        }else{
            namelink='';
        }
    }
    // if (listitem.hover){
    //     // get hover url
    //     if (listitem.sortcol=='deltaOmega'){
    //         hovlink=gwcat.getLink(listitem.names[n],'skymap-thumbnail','Cartesian zoomed');
    //         if(hovlink.length>0){
    //             hovref='<a title="'+link[0].text+'" href="'+link[0].url+'">';
    //         }
    //     }
    // }
    htmlname=(namelink) ? '<div class="evname">'+namelink+listitem.names[n]+'</a></div>' : '<div class="evname">'+listitem.names[n]+'</div>';
    htmlicon='<div class="evgraph">'+''+'</div>';
    htmlval='<div class="evval">'+val+'</div>';
    // htmlhov='<div class="info">'+this.getinfo(l,n)+'</div>';
    // htmlerr
    return(htmlname+htmlicon+htmlval+htmlerr)
}
TopTen.prototype.addinfo = function(l,n){
    listitem=this.lists[l];
    lnid=l+'_'+n;
    // get info text
    if (listitem.sortcol=='deltaOmega'){
        var hovlink=gwcat.getLink(listitem.names[n],'skymap-thumbnail','Cartesian zoomed');
        if(hovlink.length>0){
            // console.log(link);
            var hovref='<a title="'+link.text+'" href="'+link.url+'">';
        }
        return(hovref);
    }else{
        sigfig=(listitem.hasOwnProperty('sigfig'))?listitem.sigfig:gwcat.datadict[listitem.sortcol].sigfig;
        var val=setPrecision(listitem.values[n],sigfig);
        if (listitem.valtypes[n]=='lower'){val='> '+val}
        else if (listitem.valtypes[n]=='upper'){val='< '+val}
        var htmlval='<div class="infoval">'+val+'</div>';
        if (listitem.show_err && listitem.valtypes[n]=='best'){
            var fixprec=getprecision(listitem.values[n],sigfig);
            var errpos=setPrecision(listitem.errpos[n]-listitem.values[n],sigfig,fixprec=fixprec)
            var errneg=setPrecision(listitem.values[n]-listitem.errneg[n],sigfig,fixprec=fixprec)
            var htmlerr='<div class="infoerr pos">+'+errpos+'</div><div class="infoerr neg">&ndash;'+errneg+'</div>'
        }else{
            var htmlerr=''
        }
        var unit=(listitem.unit)?listitem.unit:gwcat.paramUnit((listitem.valcol)?listitem.valcol:listitem.sortcol);
        // unit=gwcat.paramUnit(listitem.sortcol)
        unit=unit.replace('M_sun','M<sub>☉</sub>')
        reSup=/\^(-?[0-9]*)(?=[\s/]|$)/g
        unit=unit.replace(reSup,"<sup>$1</sup> ");
        if (listitem.labels[n]){unit=unit+' '+listitem.labels[n]}
        var htmlunit='<div class="infounit">'+unit+'</div>';
        d3.select('#'+lnid).append('div')
            .attr('class','info')
            .attr('id','info_'+lnid)
            .html('<div class="infotxt">'+htmlval+htmlerr+htmlunit+'</div>')

        // set size of objects
        lndiv=d3.select('#info_'+lnid)
        var vw=lndiv.select('.infoval').node().clientWidth+10;
        var uw=lndiv.select('.infounit').node().clientWidth;
        var vh=lndiv.select('.infoval').node().clientHeight;
        var uh=lndiv.select('.infounit').node().clientHeight;
        lndiv.selectAll('.infoerr').style('left',vw);
        var ew=0, eh=0;
        if (listitem.show_err && listitem.valtypes[n]=='best'){
            ew=Math.max(lndiv.select('.infoerr.pos').node().clientWidth,lndiv.select('.infoerr.neg').node().clientWidth);
            eh=Math.max(lndiv.select('.infoerr.pos').node().clientHeight,lndiv.select('.infoerr.neg').node().clientHeight);
        }
        lndiv.select('.infounit').style('left',vw+ew);
        var iw=vw+ew+uw;
        var ih=Math.max(vh,eh,uh);
        var lh=d3.select('#'+l+'_'+n).node().clientHeight;
        console.log(l,n,vw,ew,iw);
        lndiv.select('.infotxt').style('width',iw);
        lndiv.select('.infotxt').style('height',ih);
        lndiv.select('.infotxt').style('top',0);

        // return('<div class="infotxt">'+htmlval+htmlerr+htmlunit+'</div>');
    }
    return;
}
TopTen.prototype.gethover = function(l,n){
    listitem=this.lists[l];
    // get hover text
    if (listitem.sortcol=='deltaOmega'){
        var hovlink=gwcat.getLink(listitem.names[n],'skymap-thumbnail','Cartesian zoomed');
        if(hovlink.length>0){
            // console.log(link);
            var hovref='<a title="'+link.text+'" href="'+link.url+'">';
        }
        return(hovref);
    }else{
        sigfig=(listitem.hasOwnProperty('sigfig'))?listitem.sigfig:gwcat.datadict[listitem.sortcol].sigfig;
        var val=setPrecision(listitem.values[n],sigfig);
        if (listitem.valtypes[n]=='lower'){val='> '+val}
        else if (listitem.valtypes[n]=='upper'){val='< '+val}
        var htmlval='<div class="ttval">'+val+'</div>';
        if (listitem.show_err && listitem.valtypes[n]=='best'){
            var fixprec=getprecision(listitem.values[n],sigfig);
            var errpos=setPrecision(listitem.errpos[n]-listitem.values[n],sigfig,fixprec=fixprec)
            var errneg=setPrecision(listitem.values[n]-listitem.errneg[n],sigfig,fixprec=fixprec)
            var htmlerr='<div class="tterr pos">+'+errpos+'</div><div class="tterr neg">&ndash;'+errneg+'</div>'
        }else{
            var htmlerr=''
        }
        var unit=(listitem.unit)?listitem.unit:gwcat.paramUnit((listitem.valcol)?listitem.valcol:listitem.sortcol);
        // unit=gwcat.paramUnit(listitem.sortcol)
        unit=unit.replace('M_sun','M<sub>☉</sub>')
        reSup=/\^(-?[0-9]*)(?=[\s/]|$)/g
        unit=unit.replace(reSup,"<sup>$1</sup> ");
        var htmlunit='<div class="ttunit">'+unit+'</div>';
        return('<div class="tttxt">'+htmlval+htmlerr+htmlunit+'</div>');
    }
}
TopTen.prototype.addicons = function(l,n){
    // add icons to an event entry
    var listitem = this.lists[l];
    icon_unit=(listitem.graph.icon_unit)?listitem.graph.icon_unit:1;
    icon_label=(listitem.graph.icon_label)?listitem.graph.icon_label:'UNKNOWN';
    if (listitem.graph.icon_fn){
        nimg=listitem.graph.icon_fn(listitem.values[n])/icon_unit;
        // console.log(listitem.values[n],listitem.graph.icon_fn(listitem.values[n]));
    }else{
        nimg=listitem.values[n]/icon_unit;
    }
    if (typeof listitem.graph.icon==="function"){
        icon=listitem.graph.icon(listitem.values[n]);
    }else{
        icon=listitem.graph.icon;
    }
    evdiv=d3.select('#'+l+'_'+n+' > .evgraph');
    for (i=1;i<=nimg;i++){
        evdiv.append('div')
            .attr('class','icon '+l+' '+l+'-'+n)
            .attr('id','icon-'+l+'-'+n+'-'+i)
        .append('img')
            .attr('src',icon)
    }
    if ((nimg%1)!=0){
        evdiv.append('div')
            .attr('class','icon part '+l+' '+l+'-'+n)
            .attr('id','icon-part-'+l+'-'+n)
        .append('img')
            .attr('src',icon)
            .attr('id','icon-part-img-'+l+'-'+n)
        partimg=d3.select('.icon.part.'+l+'-'+n);
        partimgwid=(document.getElementById('icon-part-img-'+l+'-'+n).naturalWidth*(nimg%1))+'px';
        partimg.style('width',partimgwid);
    }

}
TopTen.prototype.getBarMin = function (l) {
    var listitem = this.lists[l];
    var show_err=(listitem.show_err)?listitem.show_err:false;
    if (show_err){
        minval=Math.min.apply(null,listitem.errneg);
    }else{
        minval=Math.min.apply(null,listitem.values);
    }
    bar_min=10**Math.floor(Math.log10(minval))*(Math.floor(minval/10**Math.floor(Math.log10(minval)))-1);
    return bar_min;
};
TopTen.prototype.getBarMax = function (l) {
    var listitem = this.lists[l];
    var show_err=(listitem.show_err)?listitem.show_err:false;
    if (show_err){
        maxval=Math.max.apply(null,listitem.errpos);
    }else{
        maxval=Math.max.apply(null,listitem.values);
    }
    bar_max=10**Math.floor(Math.log10(maxval))*(Math.floor(maxval/10**Math.floor(Math.log10(maxval)))+1);
    return bar_max;
};
TopTen.prototype.addbar = function(l,n){
    // add bar for an event, with error bars if values are present
    var listitem = this.lists[l];
    var show_err=(listitem.show_err)?listitem.show_err:false;
    var bar_log=(listitem.graph.bar_log)?listitem.graph.bar_log:false;
    var bar_min=(listitem.graph.bar_min)?listitem.graph.bar_min:0;
    var bar_max=(listitem.graph.bar_max)?listitem.graph.bar_max:1;
    var bar_img=(listitem.graph.bar_img)?listitem.graph.bar_img:false;
    var bar_height=(listitem.graph.bar_height)?listitem.graph.bar_height:'auto';
    var bar_col=(listitem.graph.bar)?listitem.graph.bar_col:false;
    if (bar_max=='auto'){
        bar_max=this.getBarMax(l)
    }
    if (listitem.graph.bar_min=='auto'){
        bar_min=this.getBarMin(l)
    }
    if (bar_log){
        barlen=100*(Math.log(listitem.values[n])-Math.log(bar_min))/(Math.log(bar_max)-Math.log(bar_min));}
    else{barlen=100*(listitem.values[n]-bar_min)/(bar_max-bar_min);}
    evdiv=d3.select('#'+l+'_'+n+' > .evgraph');
    if (bar_img){
        evdiv.append('div')
            .attr('class','bar-bg img '+l+' '+l+'-'+n)
            .attr('id','bar-bg-'+l+'-'+n);
        var barbg=evdiv.select('#bar-bg-'+l+'-'+n);
        var barbgw=barbg.node().clientWidth;
        // barbg.classed('barbg-img',true);
        barbg.append('div')
            .attr('class','barimg '+l+' '+l+'-'+n)
            .attr('id','barimg-'+l+'-'+n)
            .style('width',(barlen)+'%');
        barbg.select('.barimg').append('img')
            .attr('src',bar_img)
            .style('width',barbgw);
        // if ()
        evdiv.style('height',bar_height);
    }else{
        evdiv.append('div')
            .attr('class','bar-bg '+l+' '+l+'-'+n)
            .attr('id','bar-bg-'+l+'-'+n)
        var barbg=evdiv.select('#bar-bg-'+l+'-'+n)
        barbg.append('div')
            .attr('class','bar '+l+' '+l+'-'+n)
            .attr('id','bar-'+l+'-'+n)
            .style('width',(barlen)+'%');
    }
    // var barbg=evdiv.select('#bar-bg-'+l+'-'+n)
    if (show_err){
        if (bar_log){
            errmin=100*(Math.log(listitem.errneg[n])-Math.log(bar_min))/(Math.log(bar_max)-Math.log(bar_min));
            errmax=100*(Math.log(listitem.errpos[n])-Math.log(bar_min))/(Math.log(bar_max)-Math.log(bar_min));
        }else{
            errmin=100*(listitem.errneg[n]-bar_min)/(bar_max-bar_min);
            errmax=100*(listitem.errpos[n]-bar_min)/(bar_max-bar_min);
        }
        barbg.append('div')
            .attr('class','errbar neg '+l+' '+l+'-'+n)
            .attr('id','errbar-'+l+'-'+n)
            .style('left',(errmin)+'%')
            .style('width',(barlen-errmin)+'%');
        barbg.append('div')
            .attr('class','errbar pos '+l+' '+l+'-'+n)
            .attr('id','errbar-'+l+'-'+n)
            .style('left',(barlen)+'%')
            .style('width',(errmax-barlen)+'%');
        barbg.append('div')
            .attr('class','errmin2 '+l+' '+l+'-'+n)
            .attr('id','errmin2-'+l+'-'+n)
            .style('left',(errmin)+'%');
        barbg.append('div')
            .attr('class','errmax2 '+l+' '+l+'-'+n)
            .attr('id','errmax2-'+l+'-'+n)
            .style('left',(errmax)+'%');
    }
    if (bar_img){
        barbg

    }
}
TopTen.prototype.reorderList = function(l){
    // switch ascending or descending
    oldorder=this.lists[l].order;
    neworder = (oldorder=='dec')?'asc':'dec';
    this.lists[l].order=neworder;
    this.popList(l);
    this.makeList(l);
    order=(this.lists[l].order=='asc')?'&uarr;':'&darr;'
    d3.select('#selorder-'+l).html(order)
}
TopTen.prototype.showTooltip = function(e,l,n){
    // add tooltip to sketch
    ttOut = document.getElementById("tooltip-outer")
    ttOut.style.transitionDuration = "200ms";
    ttOut.style.opacity = 0.9;
    ttOut.style.left = e.pageX + 10 ;
    ttOut.style.top = e.pageY - 10 ;
    ttOut.innerHTML = this.gethover(l,n);
    this.formatTooltip(l);
    return;
}
TopTen.prototype.formatTooltip = function(l){
    listitem=this.lists[l];
    if (listitem.sortcol=='deltaOmega'){
        return
    }else{
        var vw=d3.select('.ttval').node().clientWidth;
        var uw=d3.select('.ttunit').node().clientWidth;
        d3.selectAll('.tterr').style('left',vw);
        var ew=Math.max(d3.select('.tterr.pos').node().clientWidth,d3.select('.tterr.neg').node().clientWidth);
        d3.select('.ttunit').style('left',vw+ew);
        d3.select('#tooltip-outer').style('width',vw+ew+uw).style('height','2em');
    }
}
TopTen.prototype.hideTooltip = function(){
    // hide tooltip to skwtch
    ttOut = document.getElementById("tooltip-outer");
    // ttOut.style.transitionDuration = "500ms";
    // ttOut.style.opacity = 0.;
}

function addColumn(colname,fncalc,dict){
    // add a column to the data
    if (typeof fncalc === "function"){
        gwcat.datadict[colname]=dict;
        for (e in gwcat.data){
            ev=gwcat.data[e].name;
            val=fncalc(ev);
            if (val){gwcat.data[e][colname]=val}
        }
    }
}
function calcMratio(ev){
    // calculate mass ratio (with basic error propogation)
    if (gwcat.getBest(ev,'M2') && gwcat.getBest(ev,'M1')){
        best=gwcat.getBest(ev,'M2')/gwcat.getBest(ev,'M1');
        low1=1 - (gwcat.getMinVal(ev,'M1')/gwcat.getBest(ev,'M1'));
        low2=1 - (gwcat.getMinVal(ev,'M2')/gwcat.getBest(ev,'M2'));
        high1=1 - (gwcat.getMaxVal(ev,'M1')/gwcat.getBest(ev,'M1'));
        high2=1 - (gwcat.getMaxVal(ev,'M2')/gwcat.getBest(ev,'M2'));
        lowr=Math.sqrt((low1**2 + low2**2))
        highr=Math.sqrt((high1**2 + high2**2))
        highr=(highr+best>1)?1-best:highr;
        return {'best':best,'err':[-lowr,highr]}
    }else{return Math.NaN}
}
function calcMtotal(ev){
    // calculate total mass (with basic error propogation)
    if (gwcat.getBest(ev,'M2') && gwcat.getBest(ev,'M1')){
        best=gwcat.getBest(ev,'M2')+gwcat.getBest(ev,'M1');
        low1=1 - (gwcat.getMinVal(ev,'M1')/gwcat.getBest(ev,'M1'));
        low2=1 - (gwcat.getMinVal(ev,'M2')/gwcat.getBest(ev,'M2'));
        high1=1 - (gwcat.getMaxVal(ev,'M1')/gwcat.getBest(ev,'M1'));
        high2=1 - (gwcat.getMaxVal(ev,'M2')/gwcat.getBest(ev,'M2'));
        lowr=Math.sqrt((low1**2 + low2**2))
        highr=Math.sqrt((high1**2 + high2**2))
        return {'best':best,'err':[-lowr,highr]}
    }else{return Math.NaN}
}
function calcDelay(ev){
    // calculate delay since previous event (NB: assumes events are in ascending ordered by date)
    idx=gwcat.event2idx(ev);
    var obsruns={
        O1:{start:new Date('2015-09-12T00:00:00'),end:new Date('2016-01-19T16:00:00')},
        O2:{start:new Date('2016-11-30T16:00:00'),end:new Date('2017-08-25T22:00:00')},
        O3:{start:new Date('2019-04-01T16:00:00'),end:new Date('2020-04-01T22:00:00')}
    }
    var label='';
    if (idx==0){
        obs=gwcat.data[idx].obsrun.best;
        date1=obsruns[obs].start;
        // return(Math.POSITIVE_INFINITY)}
        label='since start of '+obs;
    }else{
        date1=new Date(gwcat.data[idx-1].UTC.best);
        label='since '+gwcat.data[idx-1].name;
    }
    date2=new Date(gwcat.data[idx].UTC.best);
    datediff=(date2-date1)/(86400*1000);
    return {'best':datediff,'label':label};
}
function iconFARfn(far){
    if (far>1){
        return Math.log10(far);
    }else{
        return -Math.log10(far);
    }

}
function imgFARfn(far){
    if (far>1){
        return 'img/unsmiley.svg';
    }else{
        return 'img/smiley.svg';
    }
}
function getprecision(val,sigfig){
    // get precision of a number (for replicating with error value)
    return Math.floor(Math.log10(Math.abs(val)))+1-sigfig;
}
function setPrecision(val,sigfig,fixprec){
    // set the displayed precision of a number, based on the sigfig, unless fixprec is given
    if (listitem.format=='fixed'){
        valOut=val.toFixed(sigfig);
    }else if(listitem.format=='exp'){
        valOut=val.toExponential(sigfig);
    }else if(listitem.format=='date'){
        reDate=/(.*)T(.*)/g
        valOut=val.replace(reDate,"$1");
    }else{
        // automatic
        if (typeof val === "number"){
            prec=(fixprec)?fixprec:getprecision(val,sigfig);
            if (Math.abs(val) > 10**(-sigfig)){
                valOut=10**prec * Math.round(val/10**prec);
                valOut=(prec<0)?valOut.toFixed(-prec):valOut;
            }else if (val==0){
                valOut=(fixprec)?val.toFixed(-fixprec):0;
            }else{
                valOut=val.toExponential(sigfig-1);
                reDate=/(.*)e(.*)/g
                valOut=valOut.replace(reDate,"$1x10<sup>$2</sup>");
            }
        }
    }
    return valOut;
}