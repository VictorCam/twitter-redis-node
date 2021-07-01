<?php
function adminer_object() {
    // required to run any plugin
    // include_once "./plugins/plugin.php";
    
    // autoloader
    // foreach (glob("plugins/*.php") as $filename) {
    //     include_once "./plugins/$filename";
    // }
    // include_once "./plugins/edit-textarea.php";
    $directory = new RecursiveDirectoryIterator(__DIR__ . '/plugins');
    $fullTree = new RecursiveIteratorIterator($directory);
    $phpFiles = new RegexIterator($fullTree, '/.+((?<!Test)+\.php$)/i', RecursiveRegexIterator::GET_MATCH);

    foreach ($phpFiles as $key => $file) {
        require_once($file[0]);
    }

    // enable extra drivers just by including them
    //~ include "./plugins/drivers/simpledb.php";
    
    $plugins = array(
        // specify enabled plugins here
        new AdminerEditTextarea(),
        new AdminerQuickFilterTables(),
    );
    
    /* It is possible to combine customization and plugins:
    class AdminerCustomization extends AdminerPlugin {
    }
    return new AdminerCustomization($plugins);
    */
    
    return new AdminerPlugin($plugins);
}

// include original Adminer or Adminer Editor
include "./latest.php";
?>