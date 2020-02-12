# Scripts and Playbooks to Deploy *The Combine*

The following scripts and Ansible playbooks are used to deploy *TheCombine* on
a PC and on the demo server, thecombine.languagetechnology.org.

## Playbooks

<table>
<tr>
  <th>Playbook</th>
  <th>Description</th>
</tr>
<tr>
  <td>playbook_server.yml</td>
  <td> <ul>
         <li>creates letsencrypt certificate</li>
         <li>create a user that can be used by the NUC to copy the certificates
         <li>install the software dependencies for <em>TheCombine</em>
  </ul> </td>
</tr>
<tr>
  <td>playbook_root_keys.yml</td>
  <td> <ul>
         <li>create ssh keys for root</li>
         <li>copy the keys to the host</li>
  </ul> </td>
<tr>
  <td>playbook_register_nuc.yml</td>
  <td>authorize root user for known NUCs to login to demo server as
  <tt>cert_user</tt></td>
</tr>
<tr>
  <td>playbook_nuc.yml</td>
  <td><ul>
        <li>set up NUC for headless operation</li>
        <li>install the software dependencies for <em>TheCombine</em></li>
        <li>create wifi access point</li>
  </ul></td>
</tr>
<tr>
  <td>playbook_publish.yml</td>
  <td>publish <em>TheCombine</em> application to specified target (NUC or demo
  server)</td>
</tr>
</table>

## Scripts

<table>
<tr>
  <th>Script</th>
  <th>Description</th>
</tr>
<tr>
  <td>build.sh</td>
  <td>builds <em>TheCombine</em> frontend and backend</td>
</tr>
<tr>
  <td>setup-nuc.sh</td>
  <td>runs the playbooks that are required to install the platform required for
   <em>TheCombine</em>.  <tt>setup-nuc.sh</tt> does not publish
   <em>TheCombine</em> on the NUC.</td>
</tr>
</table>

Each script will list its usage and the available options when run with the
<tt>-h</tt> or <tt>--help</tt> option.
