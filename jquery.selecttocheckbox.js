/*
 features : 
 
 - turn single select into radio list
 - turn multiple select into checkbox list
 - show/hide inputs
 - search/filter ( options may highlight/fade/hide ) 
 - xxx support selecting with shift
 - xxx support keybord interaction ( mark with shift , select all after ctrl+a
 - select all on list checkbox ( diff behaviour based on filter )
  
 */

;(function ( $, window, document, undefined ) {

    var pluginName = 'selectToCheckbox',
        defaults = {
            hideInput: false,
            filterEnable : false,
            filterType : 'hide',
            selectAll : false
        };
    
    
    var _uncheckAll = function( parent ){
    	parent.find('input').attr('checked', false ).trigger('change');
    }
    
    function selectToCheckbox( element, options ) {
    	
        this.element = element;
        this.elementName = element.getAttribute('name');
        
        
        this.cachedEl = $(this.element);
        
        this.multiple = !!this.cachedEl.attr('multiple');
        
        this.options = $.extend( {}, defaults, options) ;
    	this._defaults = defaults;
        this._name = pluginName;
        
        this.lastSelectedIndex = 0;
        this.shiftKey = false;
        
        this.filterValue = '';
        this.init();
    }

    selectToCheckbox.prototype.init = function () {
    	
    	var _self = this;
    	
    	// grab ref to el, cache it
    	var opts = _self.cachedEl.find('option');
    	// hide original select element
    	//_self.cachedEl.hide();
    	
    	// create snippet
    	// @TODO refactor??
    	var _snipp = '<div class="stc_w">';
    	
    	var _nav = '';
    	// render select all checkbox is select all option is enabled
    	if( _self.options.selectAll && _self.multiple ){
    		_nav +='<input class="stcsa" type="checkbox">';
    	}
    	
    	// render filter input if filterEnable == true
    	if( _self.options.filterEnable ){
    		_nav +='<input class="stcfilter" type="text" placeholder="filter...">';
    	}
    	if( _nav ) _snipp += '<div class="stc_nav">'+_nav+'</div>';
    	
    	// prepare options
    	_snipp +='<div class="stc_options"><ul>';
    	for( var i = 0; i < opts.length; i++ ){
    		// mark selected with class
    		_snipp +='<li'+(opts[i].selected ? ' class="selected"' : '')+'><label>';
    		
			_snipp +='<input class="'+(_self.options.hideInput ? 'stchide' : '')+'" name="'+_self.elementName+'" type="'+(_self.multiple ? 'checkbox' : 'radio')+'"'+
			(opts[i].selected ? ' checked="checked"' : '')+
			' value="'+opts[i].value+'">'+opts[i].text+'</label></li>';
    	}
    	
    	_snipp+='</ul></div></div>';
    	
    	// reference to new el
    	_self.newEl = $(_snipp);
    	// add after old select
    	_self.cachedEl.after(_self.newEl);
    	
    	_self.listEl = _self.newEl.find('.stc_options');
    	
    	_self.listEl.click(function(e){
    		_self.shiftKey = e.shiftKey;
    	})
    	
    	// filter logic
    	if( _self.options.filterEnable ){    		
    		_self.newEl.find('.stcfilter').keyup(function(){
    			
    			_self.filterValue = this.value;
    			
    			_self.newEl.find('.stcsa').attr('checked',false)
    			_self.newEl.find('label').removeClass();
    			_uncheckAll(_self.listEl);
    			
    			if( _self.options.filterType == 'hide' || _self.options.filterType == 'fade' ){
    				_self.listEl.find('label:not(:contains(\''+_self.filterValue+'\'))').addClass('stc'+_self.options.filterType);    				
    			}else if( _self.options.filterType == 'highlight' && _self.filterValue ){    				
    				_self.listEl.find('label:contains(\''+_self.filterValue+'\')').addClass('stc'+_self.options.filterType);
    			}	
    		});
    	}
    	
    	// select all logic
    	if( _self.options.selectAll && _self.multiple ){ 
    		_self.newEl.find('.stcsa').change(function(){
    			_self.shiftKey = false;
    			_uncheckAll(_self.listEl);
    			// 3 kinds 
    			if( _self.options.filterType == 'highlight' && ( _self.options.filterEnable && _self.filterValue )){
    				_self.listEl.find('label.stchighlight input').attr('checked', this.checked ).trigger('change');
    			}else if( _self.options.filterType == 'fade' && ( _self.options.filterEnable && _self.filterValue )){
    				_self.listEl.find('label:not(.stcfade) input').attr('checked', this.checked ).trigger('change');
    			}else{
    				_self.listEl.find('label:not(.stchide) input').attr('checked', this.checked ).trigger('change');
    			}	
    		});
    	}
    	
    	// reflect changes also in old select element
    	_self.listEl.delegate('input','change',function(e){
    		
			if( !_self.multiple ){
				
    			_self.listEl.find('.selected').removeClass('selected');
    		
			}else{
				
    			if( _self.shiftKey ){
    				_self.listEl.find('input').attr('checked', false );
    				_self.cachedEl.find('option').attr('selected',false);
    				var c = _self.listEl.find('input').index(this),
    				b=_self.lastSelectedIndex,e=c;
    				if(b>e){b=c;e=_self.lastSelectedIndex}
    				for( var i = b; i <= e; i++ ){
    					var el = _self.listEl.find('label input:eq('+i+')');
    					if( el.parent().hasClass('stchide')) continue;
    					el.attr('checked',true);
    					_self.cachedEl.find('option[value='+el[0].value+']').attr('selected',true);
    					$(el[0].parentNode.parentNode).addClass('selected');
    				}
    			}
    			
    		}
			
    		if( this.checked ){
    			// set last selected index
    			if( !_self.shiftKey )_self.lastSelectedIndex = _self.listEl.find('input').index(this);
    			// set selected option i original select element
    			_self.cachedEl.find('option[value='+this.value+']').attr('selected',true);
    			// set selected class
    			$(this.parentNode.parentNode).addClass('selected');
    		}else{
    			//
    			_self.cachedEl.find('option[value='+this.value+']').removeAttr('selected');
    			$(this.parentNode.parentNode).removeClass('selected');
    		}
    	});
        
    	
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                new selectToCheckbox( this, options ));
            }
        });
    }

})( jQuery, window, document );