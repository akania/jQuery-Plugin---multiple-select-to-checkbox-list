;(function ( $, window, document, undefined ) {

    var pluginName = 'selectToCheckbox',
        defaults = {
            width: 200,
            height : 100
    };

    
    function selectToCheckbox( element, options ) {
        this.element = element;
        this.cachedEl = $(this.element);
        this.options = $.extend( {}, defaults, options) ;
    	this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    selectToCheckbox.prototype.init = function () {
    	
    	var _self = this;
    	
    	var opts = _self.cachedEl.find('option');
    	_self.cachedEl.hide();
    	var _snipp = '<p class="stc_wrapper">';
    	for( var i = 0; i < opts.length; i++ ){
    		_snipp +='<label><input type="checkbox" '+(opts[i].selected ? 'checked="checked"' : '')+' value="'+opts[i].value+'"> '+opts[i].text+'</label><br>'
    	}
    	if(opts.length)_snipp = _snipp.substr(0,_snipp.length-4);
    	_snipp+='</p>';
    	
    	_self.newEl = $(_snipp);
    	
    	_self.cachedEl.after(_self.newEl);
    	
    	_self.newEl.delegate('input','change',function(){
    		if( this.checked ){
    			_self.cachedEl.find('option[value='+this.value+']').attr('selected',true);
    		}else{
    			_self.cachedEl.find('option[value='+this.value+']').removeAttr('selected');
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