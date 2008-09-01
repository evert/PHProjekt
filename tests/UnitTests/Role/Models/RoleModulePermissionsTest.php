<?php
/**
 * Unit test
 *
 * LICENSE: Licensed under the terms of the PHProjekt 6 License
 *
 * @copyright  Copyright (c) 2007 Mayflower GmbH (http://www.mayflower.de)
 * @license    http://phprojekt.com/license PHProjekt 6 License
 * @version    CVS: $Id:
 * @link       http://www.phprojekt.com
 * @since      File available since Release 1.0
*/
require_once 'PHPUnit/Framework.php';

/**
 * Tests Default Model class
 *
 * @copyright  Copyright (c) 2007 Mayflower GmbH (http://www.mayflower.de)
 * @license    http://phprojekt.com/license PHProjekt 6 License
 * @version    Release: @package_version@
 * @link       http://www.phprojekt.com
 * @since      File available since Release 1.0
 * @author     Eduardo Polidor <polidor@mayflower.de>
 */
class Phprojekt_RoleModelsRoleModulePermissions_Test extends PHPUnit_Framework_TestCase
{
    /**
     * Test valid method
     *
     */
    public function testRoleModelsRole()
    {
        $roleModel = new Phprojekt_Role_RoleModulePermissions();
        $return    = $roleModel->getRoleModulePermissionsById(2);
        $expected  = array(
              "data" => array(
                "1" => array(
                 "id" => 1,
                 "name" => "Project",
                 "none" => false,
                 "read" => true,
                 "write" => true,
                 "access" => true,
                 "create" => true,
                 "copy" => true,
                 "delete" => true,
                 "download" => true,
                 "admin" => true),
               "4" => array (
                 "id" => "4",
                 "name" => "Timecard",
                 "none" => true,
                 "read" => false,
                 "write" => false,
                 "access" => false,
                 "create" => false,
                 "copy" => false,
                 "delete" => false,
                 "download" => false,
                 "admin" => false),
               "5" => array (
                 "id" => "5",
                 "name" => "Timeproj",
                 "none" => true,
                 "read" => false,
                 "write" => false,
                 "access" => false,
                 "create" => false,
                 "copy" => false,
                 "delete" => false,
                 "download" => false,
                 "admin" => false)
             )
           );
        $this->assertEquals($expected, $return);
    }
}