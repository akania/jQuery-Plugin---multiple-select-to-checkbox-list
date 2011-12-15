/*
 features : 
 
 -  hide inputs
 -  search/filter ( options highlight/hide) 
 -  support selecting with shift
 -  select all on list 
  
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
        
        this.filterValue = '';
        this.init();
    }

    selectToCheckbox.prototype.init = function () {
    	
    	var _self = this;
    	
    	// grab ref to el, cache it
    	var opts = _self.cachedEl.find('option');
    	// hide original select element
    	_self.cachedEl.hide();
    	
    	// create snippet
    	// @TODO refactor??
    	var _snipp = '<div class="stc_w"><div class="stc_nav">';
    	
    	// render select all checkbox is select all option is enabled
    	if( _self.options.selectAll && _self.multiple ){
    		_snipp +='<input class="stcsa" type="checkbox">';
    	}
    	
    	// render filter input if filterEnable == true
    	if( _self.options.filterEnable ){
    		_snipp +='<input class="stcfilter" type="text" placeholder="filter...">';
    	}
    		
    	// prepare options
    	_snipp +='</div><div class="stc_options"><ul>';
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
    			_uncheckAll(_self.listEl);
    			// 3 kinds 
    			// 
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
    	_self.listEl.delegate('input','change',function(){
    		
    		if( !_self.multiple ){
    			_self.listEl.find('.selected').removeClass('selected');
    		}
    		
    		if( this.checked ){
    			_self.cachedEl.find('option[value='+this.value+']').attr('selected',true); 
    			$(this.parentNode.parentNode).addClass('selected');
    		}else{
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