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
    wpscan_cmd = ['wpscan', '--update', '--url', domain]
    nmap_hosts_cmd = ['nmap', '-sn', ip_address + '/24']
    nmap_enum_cmd = ['nmap', '-Pn', '-sn', '--script=http-enum', domain]
    nmap_dnsbrute_cmd = ['nmap', '-Pn', '-sn', '--script=dns-brute', domain]
    nmap_conf_cmd = ['nmap', '-Pn', '-sn',
                     '--script=http-config-backup', domain]
    nmap_ports_cmd = ['nmap', '-sS', '-A', '-Pn', '-p-',
                      '--script=http-title', domain]
    nmap_waf_cmd = ['nmap', '-Pn', '-sn', '-sV',
                    '--script=http-waf-fingerprint', domain]
    cmds = {'Subdomains': nmap_dnsbrute_cmd, 'WHOIS Info': whois_cmd,
            'Open Ports': nmap_ports_cmd, 'Active Hosts': nmap_hosts_cmd,
            'WPScan': wpscan_cmd, 'Directories': nmap_enum_cmd,
            'WAFs': nmap_waf_cmd, 'Config Backups': nmap_conf_cmd,
            'TXT records': dig_cmd}

    for title, cmd in cmds.items():
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
            proc.title = title
            procs.append(proc)
        except OSError:
            print '%s >> Dependency error occurred!\n' % title

    def handle_proc(proc):
        """ handles active subprocesses """
        separator = '=================='
        output = ''.join(proc.stdout.readlines())
        print proc.title
        print separator
        print output.strip()
        print separator + '\n'
        procs.remove(proc)

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

