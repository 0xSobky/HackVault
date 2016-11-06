#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Automates the reconnaissance process of web hacking.
"""
import sys
import socket
import subprocess
from time import sleep

def main():
    """ Executes main code """
    domain = sys.argv[1]
    try:
        ip_address = socket.gethostbyname(domain)
    except socket.gaierror:
        print 'Error: Domain name cannot be resolved!'
        raise
    procs = []
    whois_cmd = ['whois', domain]
    dig_cmd = ['dig', '-t', 'txt', '+short', domain]
    wpscan_cmd = ['wpscan', '--force', '--update', '--url', domain]
    nmap_hosts_cmd = ['nmap', '-sn', ip_address + '/24']
    nmap_script_names = ('dns-brute, hostmap-ip2hosts, banner,'
                         'http-robots.txt, http-crossdomainxml, http-enum,'
                         'http-config-backup, http-devframework,'
                         'http-waf-fingerprint, http-sitemap-generator,'
                         'http-xssed, http-shellshock, ftp-anon, ssl-cert,'
                         'ssl-poodle, ssl-heartbleed, ssl-enum-ciphers')
    nmap_full_cmd = ['nmap', '-sV', '-sS', '-A', '-Pn', '--script',
                     nmap_script_names, domain]
    cmds = {'TXT Records': dig_cmd, 'WHOIS Info': whois_cmd,
            'Nmap Results': nmap_full_cmd, 'Active Hosts': nmap_hosts_cmd,
            'WPScan': wpscan_cmd}

    def handle_proc(proc):
        """ handles subprocesses outputs """
        separator = '=================='
        output = ''.join(proc.stdout.readlines())
        print proc.title
        print separator
        print output.strip()
        print separator + '\n'
        procs.remove(proc)

    for title, cmd in cmds.items():
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
            proc.title = title
            procs.append(proc)
        except OSError:
            print '%s >> Dependency error occurred!\n' % title

    while True:
        for proc in procs:
            retcode = proc.poll()
            if retcode is not None:
                handle_proc(proc)
            else:
                continue
        if len(procs) == 0:
            break
        else:
            sleep(1)

if __name__ == '__main__':
    print "This is gonna take quite a while; you better go make some coffee!\n"
    main()
